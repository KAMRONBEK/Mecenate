import { useCallback, useMemo, useRef } from 'react';
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

import type { Post } from '@/src/api/types';
import { FeedErrorState } from '@/src/features/feed/FeedErrorState';
import { PostCard } from '@/src/features/feed/PostCard';
import { useFeedInfiniteQuery } from '@/src/features/feed/useFeedInfiniteQuery';
import { colors, spacing, typography } from '@/src/theme/tokens';

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
      <Text style={styles.headerTitle}>Лента</Text>
      <FlatList
        data={posts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.35}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching && !isFetchingNextPage}
            onRefresh={() => void refetch()}
            tintColor={colors.accent}
          />
        }
        ListFooterComponent={
          isFetchingNextPage ? (
            <View style={styles.footer}>
              <ActivityIndicator color={colors.accent} />
            </View>
          ) : null
        }
        ListEmptyComponent={
          !isPending ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Нет публикаций</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerTitle: {
    ...typography.screenTitle,
    color: colors.textPrimary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
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
