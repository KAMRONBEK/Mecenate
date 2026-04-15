/**
 * FlatList / VirtualizedList tuning for the feed.
 * - initialNumToRender / maxToRenderPerBatch: align with API page size (10) for first paint.
 * - windowSize: below RN default (21) to cap off-screen rows and memory on image-heavy lists.
 * @see https://reactnative.dev/docs/flatlist
 */
export const FEED_PAGE_SIZE = 10;

export const FEED_LIST_INITIAL_NUM = FEED_PAGE_SIZE;
export const FEED_LIST_MAX_BATCH = FEED_PAGE_SIZE;
/** Viewport multiples rendered ahead/behind (default 21). Lower = less memory, more recycling churn. */
export const FEED_LIST_WINDOW_SIZE = 9;

/**
 * Fraction of the visible list height — `onEndReached` fires when the end of content is within
 * this distance of the bottom edge. Higher = prefetch next page sooner (smoother fast scroll).
 * @see https://reactnative.dev/docs/flatlist#onendreachedthreshold
 */
export const FEED_END_REACHED_THRESHOLD = 0.72;
