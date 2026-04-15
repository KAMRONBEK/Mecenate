import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Comment } from '@/src/api/types';
import { AnimatedLikeButton } from '@/src/features/post-detail/AnimatedLikeButton';
import { useCreateCommentMutation } from '@/src/features/post-detail/useCreateCommentMutation';
import { usePostCommentsInfiniteQuery } from '@/src/features/post-detail/usePostCommentsInfiniteQuery';
import { usePostDetailQuery } from '@/src/features/post-detail/usePostDetailQuery';
import { useTogglePostLikeMutation } from '@/src/features/post-detail/useTogglePostLikeMutation';
import { colors, radius, spacing, typography } from '@/src/theme/tokens';

type Row = { type: 'comment'; comment: Comment } | { type: 'loading' };

export default function PostDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = typeof id === 'string' ? id : id?.[0] ?? '';
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');

  const { data: post, isPending, isError, refetch, isRefetching } = usePostDetailQuery(postId);
  const {
    data: commentsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending: commentsPending,
  } = usePostCommentsInfiniteQuery(postId);

  const likeMutation = useTogglePostLikeMutation(postId);
  const { isPending: likePending, mutate: toggleLike } = likeMutation;
  const commentMutation = useCreateCommentMutation(postId);

  const comments = useMemo(
    () => commentsData?.pages.flatMap((p) => p.comments) ?? [],
    [commentsData]
  );

  const listData: Row[] = useMemo(() => {
    const rows: Row[] = comments.map((c) => ({ type: 'comment', comment: c }));
    if (isFetchingNextPage && hasNextPage) {
      rows.push({ type: 'loading' });
    }
    return rows;
  }, [comments, isFetchingNextPage, hasNextPage]);

  const onEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderItem: ListRenderItem<Row> = useCallback(({ item }) => {
    if (item.type === 'loading') {
      return (
        <View style={styles.commentLoading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      );
    }
    const { author, text, createdAt } = item.comment;
    const name = author.displayName || author.username;
    return (
      <View style={styles.commentRow}>
        <Image source={{ uri: author.avatarUrl }} style={styles.commentAvatar} contentFit="cover" />
        <View style={styles.commentBody}>
          <Text style={styles.commentName}>{name}</Text>
          <Text style={styles.commentText}>{text}</Text>
          <Text style={styles.commentMeta}>{new Date(createdAt).toLocaleString()}</Text>
        </View>
      </View>
    );
  }, []);

  const header = useMemo(() => {
    if (!post) return null;
    const name = post.author.displayName || post.author.username;
    const isPaid = post.tier === 'paid';
    return (
      <View style={styles.headerBlock}>
        <View style={styles.authorRow}>
          <Image source={{ uri: post.author.avatarUrl }} style={styles.avatar} contentFit="cover" />
          <Text style={styles.authorName} numberOfLines={1}>
            {name}
          </Text>
        </View>
        {post.coverUrl ? (
          <Image source={{ uri: post.coverUrl }} style={styles.cover} contentFit="cover" />
        ) : null}
        {post.title ? <Text style={styles.title}>{post.title}</Text> : null}
        {isPaid && !post.body ? (
          <Text style={styles.bodyMuted}>Платный контент. Текст доступен после подписки.</Text>
        ) : (
          <Text style={styles.body}>{post.body || post.preview}</Text>
        )}
        <AnimatedLikeButton
          likesCount={post.likesCount}
          isLiked={post.isLiked === true}
          disabled={likePending}
          onPress={() => toggleLike()}
        />
        <Text style={styles.sectionTitle}>Комментарии</Text>
      </View>
    );
  }, [post, likePending, toggleLike]);

  const keyExtractor = useCallback((item: Row) => {
    if (item.type === 'loading') return '__loading__';
    return item.comment.id;
  }, []);

  const sendComment = () => {
    const t = draft.trim();
    if (!t || commentMutation.isPending) return;
    commentMutation.mutate(t, {
      onSuccess: () => setDraft(''),
    });
  };

  const backBar = (
    <View style={[styles.backBar, { paddingTop: insets.top }]}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Назад"
        style={styles.backButton}
      >
        <FontAwesome name="chevron-left" size={22} color={colors.textPrimary} />
      </Pressable>
    </View>
  );

  if (isPending && !post) {
    return (
      <View style={styles.screenRoot}>
        {backBar}
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </View>
    );
  }

  if (isError || !post) {
    return (
      <View style={styles.screenRoot}>
        {backBar}
        <View style={styles.center}>
          <Text style={styles.errorText}>Не удалось загрузить публикацию</Text>
          <Text style={styles.retry} onPress={() => void refetch()}>
            {isRefetching ? 'Загрузка…' : 'Повторить'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screenRoot}>
      {backBar}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 44 : 0}
      >
        <FlatList
          data={listData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={header}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={
            commentsPending ? (
              <View style={styles.emptyLoading}>
                <ActivityIndicator color={colors.accent} />
              </View>
            ) : (
              <Text style={styles.emptyComments}>Пока нет комментариев</Text>
            )
          }
          removeClippedSubviews={false}
        />
        <View style={[styles.composer, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
          <TextInput
            style={styles.input}
            placeholder="Написать комментарий…"
            placeholderTextColor={colors.textMuted}
            value={draft}
            onChangeText={setDraft}
            multiline
            maxLength={500}
          />
          <Text
            style={[styles.send, (!draft.trim() || commentMutation.isPending) && styles.sendDisabled]}
            onPress={sendComment}
          >
            Отправить
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backBar: {
    paddingHorizontal: spacing.sm,
    paddingBottom: spacing.xs,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flex: { flex: 1, backgroundColor: colors.background },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  retry: {
    ...typography.body,
    color: colors.accent,
    marginTop: spacing.md,
    fontWeight: '600',
  },
  headerBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.border,
  },
  authorName: {
    ...typography.title,
    color: colors.textPrimary,
    flex: 1,
  },
  cover: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radius.lg,
    backgroundColor: colors.border,
  },
  title: {
    ...typography.postTitle,
    color: colors.textPrimary,
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
  },
  bodyMuted: {
    ...typography.body,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  sectionTitle: {
    ...typography.title,
    fontSize: 18,
    color: colors.textPrimary,
    marginTop: spacing.sm,
  },
  emptyLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.border,
  },
  commentBody: {
    flex: 1,
    minWidth: 0,
  },
  commentName: {
    ...typography.meta,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  commentText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 2,
  },
  commentMeta: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  commentLoading: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  emptyComments: {
    ...typography.body,
    color: colors.textMuted,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.textPrimary,
    maxHeight: 120,
    minHeight: 40,
    paddingVertical: spacing.sm,
  },
  send: {
    ...typography.body,
    fontWeight: '600',
    color: colors.accent,
    paddingVertical: spacing.sm,
  },
  sendDisabled: {
    opacity: 0.4,
  },
});
