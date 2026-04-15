import { useQuery } from '@tanstack/react-query';

import { fetchPostById } from '@/src/api/http';
import type { Post } from '@/src/api/types';
import { postDetailKey } from '@/src/features/post-detail/postCache';
import { authStore } from '@/src/stores/authStore';

export function usePostDetailQuery(postId: string) {
  const userId = authStore.userId;
  return useQuery({
    queryKey: postDetailKey(userId, postId),
    queryFn: async (): Promise<Post> => {
      const res = await fetchPostById(postId);
      if (!res.ok) throw new Error('Post not found');
      return res.data.post;
    },
    enabled: Boolean(postId),
  });
}
