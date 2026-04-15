import { useCallback, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Post } from '@/src/api/types';
import { FeedErrorState } from '@/src/features/feed/FeedErrorState';
import {
  FEED_LIST_INITIAL_NUM,
  FEED_LIST_MAX_BATCH,
  FEED_LIST_WINDOW_SIZE,
} from '@/src/features/feed/feedListConfig';
import { PostCard } from '@/src/features/feed/PostCard';
import { useFeedInfiniteQuery } from '@/src/features/feed/useFeedInfiniteQuery';
import { colors, spacing, typography } from '@/src/theme/tokens';

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

  const renderItem: ListRenderItem<Post> = useCallback(({ item }) => <PostCard post={item} />, []);

  const keyExtractor = useCallback((item: Post) => item.id, []);

  const listFooter = useMemo(
    () =>
      isFetchingNextPage ? (
        <View style={styles.footer}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : null,
    [isFetchingNextPage]
  );

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
        data={posts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        removeClippedSubviews={Platform.OS !== 'web'}
        initialNumToRender={FEED_LIST_INITIAL_NUM}
        maxToRenderPerBatch={FEED_LIST_MAX_BATCH}
        windowSize={FEED_LIST_WINDOW_SIZE}
        updateCellsBatchingPeriod={50}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.35}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={() => void refetch()}
            tintColor={colors.accent}
          />
        }
        ListFooterComponent={listFooter}
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
  footer: {
    paddingVertical: spacing.lg,
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
