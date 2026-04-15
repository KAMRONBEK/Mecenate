import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

import { fetchPostsPage } from '@/src/api/http';
import type { FeedTierFilter } from '@/src/api/types';
import { FEED_PAGE_SIZE } from '@/src/features/feed/feedListConfig';
import { authStore } from '@/src/stores/authStore';

type Options = {
  tier?: FeedTierFilter;
};

export function useFeedInfiniteQuery(options: Options = {}) {
  const { tier = 'all' } = options;
  return useInfiniteQuery({
    queryKey: ['posts', 'feed', authStore.userId, tier],
    initialPageParam: undefined as string | undefined,
    /** Avoid empty layout / full-screen loader when switching tier tabs. */
    placeholderData: keepPreviousData,
    queryFn: async ({ pageParam }) => {
      const res = await fetchPostsPage({
        limit: FEED_PAGE_SIZE,
        cursor: pageParam,
        tier,
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
