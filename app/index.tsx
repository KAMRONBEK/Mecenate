import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Post } from '@/src/api/types';
import { FeedErrorState } from '@/src/features/feed/FeedErrorState';
import {
  FEED_END_REACHED_THRESHOLD,
  FEED_LIST_INITIAL_NUM,
  FEED_LIST_MAX_BATCH,
  FEED_LIST_WINDOW_SIZE,
} from '@/src/features/feed/feedListConfig';
import { PostCard } from '@/src/features/feed/PostCard';
import { PostCardSkeleton } from '@/src/features/feed/PostCardSkeleton';
import { useFeedInfiniteQuery } from '@/src/features/feed/useFeedInfiniteQuery';
import { colors, spacing, typography } from '@/src/theme/tokens';

type FeedListItem = { type: 'post'; post: Post } | { type: 'loading' };

function FeedEmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyText}>Нет публикаций</Text>
    </View>
  );
}

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const endReachedBusy = useRef(false);
  /** First visible post card height — drives bottom skeleton height to match real rows. */
  const [samplePostHeight, setSamplePostHeight] = useState<number | null>(null);

  const {
    data,
    isPending,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useFeedInfiniteQuery();

  const posts = useMemo(() => data?.pages.flatMap((p) => p.posts) ?? [], [data]);

  const listData: FeedListItem[] = useMemo(() => {
    const items: FeedListItem[] = posts.map((post) => ({ type: 'post', post }));
    if (isFetchingNextPage && hasNextPage) {
      items.push({ type: 'loading' });
    }
    return items;
  }, [posts, isFetchingNextPage, hasNextPage]);

  const onEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    if (endReachedBusy.current) return;
    endReachedBusy.current = true;
    fetchNextPage().finally(() => {
      setTimeout(() => {
        endReachedBusy.current = false;
      }, 400);
    });
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const onFirstPostLayout = useCallback((e: LayoutChangeEvent) => {
    setSamplePostHeight(e.nativeEvent.layout.height);
  }, []);

  const renderItem: ListRenderItem<FeedListItem> = useCallback(
    ({ item, index }) =>
      item.type === 'loading' ? (
        <PostCardSkeleton targetHeight={samplePostHeight} />
      ) : (
        <PostCard post={item.post} onLayout={index === 0 ? onFirstPostLayout : undefined} />
      ),
    [samplePostHeight, onFirstPostLayout]
  );

  const keyExtractor = useCallback((item: FeedListItem) => (item.type === 'loading' ? '__loading__' : item.post.id), []);

  const showFatalError = isError && posts.length === 0;

  if (showFatalError) {
    return (
      <FeedErrorState
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  if (isPending && !data) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <FlatList
        data={listData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        // Avoid scroll jumps when appending rows (native default clips off-screen cells aggressively).
        removeClippedSubviews={false}
        initialNumToRender={FEED_LIST_INITIAL_NUM}
        maxToRenderPerBatch={FEED_LIST_MAX_BATCH}
        windowSize={FEED_LIST_WINDOW_SIZE}
        updateCellsBatchingPeriod={50}
        onEndReached={onEndReached}
        onEndReachedThreshold={FEED_END_REACHED_THRESHOLD}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={() => void refetch()}
            tintColor={colors.accent}
          />
        }
        ListEmptyComponent={FeedEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  empty: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
