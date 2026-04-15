import { useMutation, useQueryClient } from '@tanstack/react-query';

import { togglePostLike } from '@/src/api/http';
import type { Post } from '@/src/api/types';
import { patchPostInCaches, postDetailKey } from '@/src/features/post-detail/postCache';
import { authStore } from '@/src/stores/authStore';

export function useTogglePostLikeMutation(postId: string) {
  const queryClient = useQueryClient();
  const userId = authStore.userId;

  return useMutation({
    mutationFn: async () => {
      const res = await togglePostLike(postId);
      if (!res.ok) throw new Error('Like failed');
      return res.data;
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: postDetailKey(userId, postId) });
      const prev = queryClient.getQueryData<Post>(postDetailKey(userId, postId));
      if (prev) {
        const wasLiked = prev.isLiked === true;
        const nextLiked = !wasLiked;
        const likesDelta = nextLiked ? 1 : -1;
        const patch = {
          isLiked: nextLiked,
          likesCount: Math.max(0, prev.likesCount + likesDelta),
        };
        queryClient.setQueryData<Post>(postDetailKey(userId, postId), { ...prev, ...patch });
        patchPostInCaches(queryClient, userId, postId, patch);
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(postDetailKey(userId, postId), ctx.prev);
        patchPostInCaches(queryClient, userId, postId, {
          likesCount: ctx.prev.likesCount,
          isLiked: ctx.prev.isLiked,
        });
      }
    },
    onSuccess: (data) => {
      patchPostInCaches(queryClient, userId, postId, {
        isLiked: data.isLiked,
        likesCount: data.likesCount,
      });
      queryClient.setQueryData<Post>(postDetailKey(userId, postId), (old) =>
        old ? { ...old, isLiked: data.isLiked, likesCount: data.likesCount } : old
      );
    },
  });
}
