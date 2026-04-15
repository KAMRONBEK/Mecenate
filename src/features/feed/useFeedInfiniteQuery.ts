import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchPostsPage } from '@/src/api/http';
import { FEED_PAGE_SIZE } from '@/src/features/feed/feedListConfig';
import { authStore } from '@/src/stores/authStore';

/** Extra wait before each feed request so skeleton / loading states are visible. Set to `0` to disable. */
const FEED_ARTIFICIAL_DELAY_MS = 2000;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useFeedInfiniteQuery() {
  return useInfiniteQuery({
    queryKey: ['posts', 'feed', authStore.userId],
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      if (FEED_ARTIFICIAL_DELAY_MS > 0) {
        await delay(FEED_ARTIFICIAL_DELAY_MS);
      }
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
