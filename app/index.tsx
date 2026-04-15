import { useRouter } from 'expo-router';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { FeedTierFilter, Post } from '@/src/api/types';
import { FeedErrorState } from '@/src/features/feed/FeedErrorState';
import { FeedTierTabs } from '@/src/features/feed/FeedTierTabs';
import {
  FEED_END_REACHED_THRESHOLD,
  FEED_LIST_INITIAL_NUM,
  FEED_LIST_MAX_BATCH,
  FEED_LIST_WINDOW_SIZE,
} from '@/src/features/feed/feedListConfig';
import { PostCard } from '@/src/features/feed/PostCard';
import { PostCardSkeleton } from '@/src/features/feed/PostCardSkeleton';
import { useFeedInfiniteQuery } from '@/src/features/feed/useFeedInfiniteQuery';
import { useFeedPostLikeMutation } from '@/src/features/feed/useFeedPostLikeMutation';
import { useFeedSkeletonAnchorHeight } from '@/src/features/feed/useFeedSkeletonAnchorHeight';
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
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const endReachedBusy = useRef(false);
  const listRef = useRef<FlatList<FeedListItem>>(null);
  const [tier, setTier] = useState<FeedTierFilter>('all');
  const likeMutation = useFeedPostLikeMutation();

  const openPostDetail = useCallback(
    (postId: string) => {
      router.push({ pathname: '/post/[id]', params: { id: postId } });
    },
    [router]
  );

  const {
    data,
    isPending,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isRefetching,
  } = useFeedInfiniteQuery({ tier });

  useLayoutEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [tier]);

  const posts = useMemo(() => data?.pages.flatMap((p) => p.posts) ?? [], [data]);

  const { anchorHeight, onAnchorPostLayout, isAnchorIndex } = useFeedSkeletonAnchorHeight(posts.length);

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

  const renderItem: ListRenderItem<FeedListItem> = useCallback(
    ({ item, index }) =>
      item.type === 'loading' ? (
        <PostCardSkeleton targetHeight={anchorHeight} />
      ) : (
        <PostCard
          post={item.post}
          onLayout={isAnchorIndex(index) ? onAnchorPostLayout : undefined}
          onPressContent={() => openPostDetail(item.post.id)}
          onPressLike={() => likeMutation.mutate(item.post.id)}
          onPressComments={() => openPostDetail(item.post.id)}
          likeDisabled={likeMutation.isPending && likeMutation.variables === item.post.id}
        />
      ),
    [anchorHeight, onAnchorPostLayout, isAnchorIndex, likeMutation, openPostDetail]
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
        <ActivityIndicator size="large" color={colors.feedTabActive} />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.feedToolbar}>
        <FeedTierTabs value={tier} onChange={setTier} />
      </View>
      <FlatList
        ref={listRef}
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
            tintColor={colors.feedTabActive}
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
  feedToolbar: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
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
