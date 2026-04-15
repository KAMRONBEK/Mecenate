import { useMutation, useQueryClient } from '@tanstack/react-query';

import { togglePostLike } from '@/src/api/http';
import { patchPostInCaches } from '@/src/features/post-detail/postCache';
import { authStore } from '@/src/stores/authStore';

/**
 * Toggle like from the feed; keeps feed and post-detail caches in sync.
 */
export function useFeedPostLikeMutation() {
  const queryClient = useQueryClient();
  const userId = authStore.userId;

  return useMutation({
    mutationFn: (postId: string) => togglePostLike(postId),
    onSuccess: (res, postId) => {
      if (!res.ok) return;
      patchPostInCaches(queryClient, userId, postId, {
        isLiked: res.data.isLiked,
        likesCount: res.data.likesCount,
      });
    },
  });
}
