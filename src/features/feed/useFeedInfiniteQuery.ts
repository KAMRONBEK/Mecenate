import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchPostsPage } from '@/src/api/http';
import { FEED_PAGE_SIZE } from '@/src/features/feed/feedListConfig';
import { authStore } from '@/src/stores/authStore';

export function useFeedInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: ['posts', 'feed', authStore.userId],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const res = await fetchPostsPage({
        limit: FEED_PAGE_SIZE,
        cursor: pageParam,
      });
      if (!res.ok) {
        throw new Error('Feed response not ok');
      }
      return res.data;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore || !lastPage.nextCursor) return undefined;
      return lastPage.nextCursor;
    },
  });
}
