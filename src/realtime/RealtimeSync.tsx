import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { getWsUrl } from '@/src/api/http';
import type { Comment, Post } from '@/src/api/types';
import {
  appendCommentToCache,
  patchPostInCaches,
  postDetailKey,
} from '@/src/features/post-detail/postCache';
import { authStore } from '@/src/stores/authStore';

type WsMessage =
  | { type: 'ping' }
  | { type: 'like_updated'; postId: string; likesCount: number }
  | { type: 'comment_added'; postId: string; comment: Comment };

const RECONNECT_MS = 2500;

export function RealtimeSync() {
  const queryClient = useQueryClient();
  const userId = authStore.userId;
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let stopped = false;

    const clearReconnect = () => {
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
    };

    const scheduleReconnect = () => {
      clearReconnect();
      reconnectTimer.current = setTimeout(() => {
        if (!stopped) connect();
      }, RECONNECT_MS);
    };

    const handleMessage = (raw: string) => {
      let msg: WsMessage;
      try {
        msg = JSON.parse(raw) as WsMessage;
      } catch {
        return;
      }
      if (msg.type === 'ping') return;
      if (msg.type === 'like_updated') {
        patchPostInCaches(queryClient, userId, msg.postId, { likesCount: msg.likesCount });
        return;
      }
      if (msg.type === 'comment_added') {
        const { postId, comment } = msg;
        const added = appendCommentToCache(queryClient, userId, postId, comment);
        if (!added) return;
        const post = queryClient.getQueryData<Post>(postDetailKey(userId, postId));
        if (post) {
          const next = post.commentsCount + 1;
          queryClient.setQueryData<Post>(postDetailKey(userId, postId), {
            ...post,
            commentsCount: next,
          });
          patchPostInCaches(queryClient, userId, postId, { commentsCount: next });
        }
      }
    };

    const connect = () => {
      clearReconnect();
      try {
        const ws = new WebSocket(getWsUrl());
        wsRef.current = ws;
        ws.onmessage = (ev) => {
          if (typeof ev.data === 'string') handleMessage(ev.data);
        };
        ws.onerror = () => {
          ws.close();
        };
        ws.onclose = () => {
          wsRef.current = null;
          if (!stopped) scheduleReconnect();
        };
      } catch {
        if (!stopped) scheduleReconnect();
      }
    };

    connect();

    return () => {
      stopped = true;
      clearReconnect();
      wsRef.current?.close();
      wsRef.current = null;
    };
  }, [queryClient, userId]);

  return null;
}
