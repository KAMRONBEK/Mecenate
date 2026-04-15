import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchPostsPage } from '@/src/api/http';
import { authStore } from '@/src/stores/authStore';

const FEED_LIMIT = 10;

export function useFeedInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: ['posts', 'feed', authStore.userId],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const res = await fetchPostsPage({
        limit: FEED_LIMIT,
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
