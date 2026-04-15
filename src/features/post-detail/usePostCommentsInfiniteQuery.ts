import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchCommentsPage } from '@/src/api/http';
import type { CommentsPageData } from '@/src/features/post-detail/postCache';
import { commentsKey } from '@/src/features/post-detail/postCache';
import { authStore } from '@/src/stores/authStore';

const COMMENTS_PAGE = 20;

export function usePostCommentsInfiniteQuery(postId: string) {
  const userId = authStore.userId;
  return useInfiniteQuery({
    queryKey: commentsKey(userId, postId),
    initialPageParam: undefined as string | undefined,
    enabled: Boolean(postId),
    queryFn: async ({ pageParam }): Promise<CommentsPageData> => {
      const res = await fetchCommentsPage({
        postId,
        limit: COMMENTS_PAGE,
        cursor: pageParam,
      });
      if (!res.ok) throw new Error('Comments failed');
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore || !lastPage.nextCursor) return undefined;
      return lastPage.nextCursor;
    },
  });
}
