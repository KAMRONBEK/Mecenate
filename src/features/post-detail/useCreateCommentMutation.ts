import { useMutation, useQueryClient } from '@tanstack/react-query';

import { postComment } from '@/src/api/http';
import type { Post } from '@/src/api/types';
import { appendCommentToCache, patchPostInCaches, postDetailKey } from '@/src/features/post-detail/postCache';
import { authStore } from '@/src/stores/authStore';

export function useCreateCommentMutation(postId: string) {
  const queryClient = useQueryClient();
  const userId = authStore.userId;

  return useMutation({
    mutationFn: async (text: string) => {
      const res = await postComment(postId, text.trim());
      if (!res.ok) throw new Error('Comment failed');
      return res.data.comment;
    },
    onSuccess: (comment) => {
      appendCommentToCache(queryClient, userId, postId, comment);
      const post = queryClient.getQueryData<Post>(postDetailKey(userId, postId));
      if (post) {
        const nextCount = post.commentsCount + 1;
        queryClient.setQueryData<Post>(postDetailKey(userId, postId), {
          ...post,
          commentsCount: nextCount,
        });
        patchPostInCaches(queryClient, userId, postId, { commentsCount: nextCount });
      }
    },
  });
}
