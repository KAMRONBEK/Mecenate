import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { KeyboardAvoidingView, useKeyboardState } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HeartFilled from '@/assets/svgs/heart.svg';
import HeartOutlined from '@/assets/svgs/heart-outlined.svg';
import MessageIcon from '@/assets/svgs/message.svg';
import SendIcon from '@/assets/svgs/send.svg';
import type { Comment } from '@/src/api/types';
import { useCreateCommentMutation } from '@/src/features/post-detail/useCreateCommentMutation';
import { usePostCommentsInfiniteQuery } from '@/src/features/post-detail/usePostCommentsInfiniteQuery';
import { usePostDetailQuery } from '@/src/features/post-detail/usePostDetailQuery';
import { useTogglePostLikeMutation } from '@/src/features/post-detail/useTogglePostLikeMutation';
import { colors, commentComposer, radius, spacing, typography } from '@/src/theme/tokens';

/** Enlarged touch target for comment like (icon is small; API has no comment-like endpoint yet). */
const COMMENT_LIKE_HIT_SLOP = { top: 18, bottom: 18, left: 16, right: 16 } as const;

/** Second tap within this window (same comment) counts as double-tap → like */
const COMMENT_DOUBLE_TAP_MS = 280;
const COMMENTS_REVEAL_TOP_PADDING = spacing.sm;
const COMMENT_AFTER_SEND_EXTRA_OFFSET = 72;

type CommentLikeOverride = { likesCount: number; isLiked: boolean };

function mergeCommentLike(comment: Comment, override?: CommentLikeOverride): CommentLikeOverride {
  if (override) return override;
  return {
    likesCount: comment.likesCount ?? 0,
    isLiked: comment.isLiked === true,
  };
}

/** Russian plural for "комментарий" — matches Figma "4 комментария" style labels */
function formatRuCommentsCount(n: number): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs >= 11 && abs <= 14) return `${n} комментариев`;
  if (last === 1) return `${n} комментарий`;
  if (last >= 2 && last <= 4) return `${n} комментария`;
  return `${n} комментариев`;
}

type CommentRowProps = {
  comment: Comment;
  override?: CommentLikeOverride;
  onContentPress: (comment: Comment) => void;
  onLikePress: (comment: Comment) => void;
};

const CommentRow = ({
  comment,
  override,
  onContentPress,
  onLikePress,
}: CommentRowProps) => {
  const { author, text } = comment;
  const name = author.displayName || author.username;
  const { likesCount, isLiked } = mergeCommentLike(comment, override);

  return (
    <View style={styles.commentRow}>
      <Pressable
        onPress={() => onContentPress(comment)}
        style={styles.commentTapArea}
        accessibilityRole="button"
        accessibilityLabel="Комментарий. Дважды нажмите, чтобы поставить лайк"
      >
        <Image source={{ uri: author.avatarUrl }} style={styles.commentAvatar} contentFit="cover" />
        <View style={styles.commentBody}>
          <Text style={styles.commentName}>{name}</Text>
          <Text style={styles.commentText}>{text}</Text>
        </View>
      </Pressable>
      <Pressable
        hitSlop={COMMENT_LIKE_HIT_SLOP}
        onPress={() => onLikePress(comment)}
        style={({ pressed }) => [styles.commentLikePressable, pressed && styles.commentLikePressed]}
        accessibilityRole="button"
        accessibilityLabel={isLiked ? 'Убрать лайк с комментария' : 'Лайкнуть комментарий'}
        accessibilityState={{ selected: isLiked }}
      >
        {isLiked ? (
          <HeartFilled width={17} height={15} color={colors.likePillActive} />
        ) : (
          <HeartOutlined width={17} height={15} color={colors.iconPill} />
        )}
        <Text style={[styles.commentLikeCount, isLiked && styles.commentLikeCountActive]}>{likesCount}</Text>
      </Pressable>
    </View>
  );
};

const MemoCommentRow = memo(CommentRow, (prev, next) => {
  return (
    prev.comment === next.comment &&
    prev.override?.likesCount === next.override?.likesCount &&
    prev.override?.isLiked === next.override?.isLiked &&
    prev.onContentPress === next.onContentPress &&
    prev.onLikePress === next.onLikePress
  );
});

export default function PostDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const postId = typeof id === 'string' ? id : id?.[0] ?? '';
  const insets = useSafeAreaInsets();
  const keyboardVisible = useKeyboardState((s) => s.isVisible);
  const [draft, setDraft] = useState('');
  const [commentsNewestFirst, setCommentsNewestFirst] = useState(true);
  /** Local toggles — backend OpenAPI has no POST …/comments/…/like; replace with mutation when available. */
  const [commentLikeOverrides, setCommentLikeOverrides] = useState<Record<string, CommentLikeOverride>>({});
  const listRef = useRef<FlatList<Comment>>(null);
  const commentsAnchorYRef = useRef<number>(0);
  const currentScrollOffsetRef = useRef(0);
  const didAutoRevealCommentsRef = useRef(false);

  const composerBottomPadding = keyboardVisible
    ? spacing.md
    : Math.max(insets.bottom, spacing.md);

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

  const orderedComments = useMemo(() => {
    if (!commentsNewestFirst) return comments;
    return [...comments].reverse();
  }, [comments, commentsNewestFirst]);

  const onEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const scrollToComments = useCallback((extraOffset = 0, preserveCurrentOffset = true) => {
    const targetOffset = Math.max(
      0,
      commentsAnchorYRef.current - COMMENTS_REVEAL_TOP_PADDING + extraOffset
    );
    listRef.current?.scrollToOffset({
      offset: preserveCurrentOffset
        ? Math.max(currentScrollOffsetRef.current, targetOffset)
        : targetOffset,
      animated: true,
    });
  }, []);

  const revealOwnComment = useCallback(() => {
    if (commentsNewestFirst) {
      scrollToComments(COMMENT_AFTER_SEND_EXTRA_OFFSET, false);
      return;
    }
    listRef.current?.scrollToEnd({ animated: true });
  }, [commentsNewestFirst, scrollToComments]);

  const handleCommentsSectionLayout = useCallback(
    (y: number) => {
      commentsAnchorYRef.current = y;
      if (didAutoRevealCommentsRef.current) return;
      didAutoRevealCommentsRef.current = true;
      requestAnimationFrame(() => scrollToComments());
    },
    [scrollToComments]
  );

  const lastCommentTapRef = useRef<{ id: string; time: number } | null>(null);

  const ensureCommentLiked = useCallback((comment: Comment) => {
    let applied = false;
    setCommentLikeOverrides((prev) => {
      const cur = mergeCommentLike(comment, prev[comment.id]);
      if (cur.isLiked) return prev;
      applied = true;
      return {
        ...prev,
        [comment.id]: { likesCount: cur.likesCount + 1, isLiked: true },
      };
    });
    if (applied) void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, []);

  const toggleCommentLike = useCallback((comment: Comment) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCommentLikeOverrides((prev) => {
      const cur = mergeCommentLike(comment, prev[comment.id]);
      const nextLiked = !cur.isLiked;
      const nextCount = Math.max(0, cur.likesCount + (nextLiked ? 1 : -1));
      return { ...prev, [comment.id]: { likesCount: nextCount, isLiked: nextLiked } };
    });
  }, []);

  const onCommentContentPress = useCallback(
    (comment: Comment) => {
      const now = Date.now();
      const prev = lastCommentTapRef.current;
      if (prev && prev.id === comment.id && now - prev.time < COMMENT_DOUBLE_TAP_MS) {
        lastCommentTapRef.current = null;
        ensureCommentLiked(comment);
        return;
      }
      lastCommentTapRef.current = { id: comment.id, time: now };
    },
    [ensureCommentLiked]
  );

  const renderItem: ListRenderItem<Comment> = useCallback(
    ({ item }) => (
      <MemoCommentRow
        comment={item}
        override={commentLikeOverrides[item.id]}
        onContentPress={onCommentContentPress}
        onLikePress={toggleCommentLike}
      />
    ),
    [commentLikeOverrides, onCommentContentPress, toggleCommentLike]
  );

  const listFooter = useMemo(() => {
    if (!isFetchingNextPage || !hasNextPage) return null;
    return (
      <View style={styles.commentLoading}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }, [hasNextPage, isFetchingNextPage]);

  const listEmptyComponent = useMemo(() => {
    if (commentsPending) {
      return (
        <View style={styles.emptyLoading}>
          <ActivityIndicator color={colors.accent} />
        </View>
      );
    }
    return <Text style={styles.emptyComments}>Пока нет комментариев</Text>;
  }, [commentsPending]);

  const header = useMemo(() => {
    if (!post) return null;
    const name = post.author.displayName || post.author.username;
    const isPaid = post.tier === 'paid';
    const userHasLiked = post.isLiked === true;
    return (
      <View style={styles.headerBlock}>
        <View style={styles.authorHeaderStrip}>
          <View style={styles.postHeadPadded}>
            <View style={styles.authorRow}>
              <Image source={{ uri: post.author.avatarUrl }} style={styles.avatar} contentFit="cover" />
              <Text style={styles.authorName} numberOfLines={1}>
                {name}
              </Text>
            </View>
          </View>
        </View>
        {post.coverUrl ? (
          <Image source={{ uri: post.coverUrl }} style={styles.cover} contentFit="cover" />
        ) : null}
        <View style={styles.postHeadPadded}>
          <View style={styles.textBlock}>
            {post.title ? <Text style={styles.title}>{post.title}</Text> : null}
            {isPaid && !post.body ? (
              <Text style={styles.bodyMuted}>Платный контент. Текст доступен после подписки.</Text>
            ) : (
              <Text style={styles.body}>{post.body || post.preview}</Text>
            )}
          </View>
          <View style={styles.engagementRow}>
            <Pressable
              onPress={() => toggleLike()}
              disabled={likePending}
              style={({ pressed }) => [
                styles.pill,
                userHasLiked && styles.pillLiked,
                pressed && styles.pillPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Лайки"
            >
              {userHasLiked ? (
                <HeartFilled width={17} height={15} color={colors.likePillOnActive} />
              ) : (
                <HeartOutlined width={17} height={15} color={colors.iconPill} />
              )}
              <Text style={[styles.pillText, userHasLiked && styles.pillTextLiked]}>{post.likesCount}</Text>
            </Pressable>
            <View
              style={styles.pill}
              accessibilityLabel={`Комментариев: ${post.commentsCount}`}
              accessibilityRole="text"
            >
              <MessageIcon width={15} height={15} color={colors.iconPill} />
              <Text style={styles.pillText}>{post.commentsCount}</Text>
            </View>
          </View>
          <View
            style={styles.commentsSectionHead}
            onLayout={(event) => handleCommentsSectionLayout(event.nativeEvent.layout.y)}
          >
            <Text style={styles.commentsCountLabel}>{formatRuCommentsCount(post.commentsCount)}</Text>
            <Pressable
              onPress={() => setCommentsNewestFirst((v) => !v)}
              accessibilityRole="button"
              accessibilityLabel={
                commentsNewestFirst ? 'Переключить на сначала старые' : 'Переключить на сначала новые'
              }
            >
              <Text style={styles.commentsSortLink}>
                {commentsNewestFirst ? 'Сначала новые' : 'Сначала старые'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    );
  }, [post, likePending, toggleLike, commentsNewestFirst, handleCommentsSectionLayout]);

  const keyExtractor = useCallback((item: Comment) => item.id, []);

  const sendComment = () => {
    const t = draft.trim();
    if (!t || commentMutation.isPending) return;
    commentMutation.mutate(t, {
      onSuccess: () => {
        setDraft('');
        requestAnimationFrame(() => {
          requestAnimationFrame(() => revealOwnComment());
        });
      },
    });
  };

  const screenPadding = { paddingTop: insets.top };
  const canSendComment = Boolean(draft.trim()) && !commentMutation.isPending;
  const sendIconColor = canSendComment
    ? commentComposer.sendIcon.colorActive
    : commentComposer.sendIcon.colorDisabled;

  if (isPending && !post) {
    return (
      <View style={[styles.screenRoot, screenPadding]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </View>
    );
  }

  if (isError || !post) {
    return (
      <View style={[styles.screenRoot, screenPadding]}>
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
    <View style={[styles.screenRoot, screenPadding]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior="translate-with-padding"
      >
        <FlatList
          ref={listRef}
          data={orderedComments}
          extraData={commentLikeOverrides}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={header}
          contentContainerStyle={{ paddingBottom: spacing.xl }}
          ListFooterComponent={listFooter}
          initialNumToRender={8}
          maxToRenderPerBatch={6}
          windowSize={7}
          updateCellsBatchingPeriod={50}
          keyboardShouldPersistTaps="handled"
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
          onScroll={(event) => {
            currentScrollOffsetRef.current = event.nativeEvent.contentOffset.y;
          }}
          scrollEventThrottle={16}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.4}
          ListEmptyComponent={listEmptyComponent}
          removeClippedSubviews={Platform.OS === 'android'}
        />
        <View style={[styles.composer, { paddingBottom: composerBottomPadding }]}>
          <View style={styles.composerRow}>
            <View style={styles.inputShell}>
              <TextInput
                style={styles.input}
                placeholder="Ваш комментарий"
                placeholderTextColor={colors.textMuted}
                value={draft}
                onChangeText={setDraft}
                multiline
                maxLength={500}
                underlineColorAndroid="transparent"
                cursorColor={colors.textPrimary}
                selectionColor={colors.accent}
                textAlignVertical={Platform.OS === 'android' ? 'top' : undefined}
              />
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Отправить комментарий"
              disabled={!canSendComment}
              onPress={sendComment}
              style={({ pressed }) => [
                styles.sendBtn,
                !canSendComment && styles.sendDisabled,
                pressed && canSendComment && styles.sendPressed,
              ]}
            >
              <SendIcon
                width={commentComposer.sendIcon.width}
                height={commentComposer.sendIcon.height}
                color={sendIconColor}
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  flex: { flex: 1, backgroundColor: colors.surface },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
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
    paddingTop: spacing.md,
    gap: 0,
    backgroundColor: colors.surface,
  },
  authorHeaderStrip: {
    backgroundColor: colors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  postHeadPadded: {
    paddingHorizontal: spacing.lg,
  },
  textBlock: {
    gap: spacing.xs,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    borderRadius: 0,
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
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.pillBackground,
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
  },
  pillLiked: {
    backgroundColor: colors.likePillActive,
  },
  pillText: {
    ...typography.meta,
    color: colors.iconPill,
  },
  pillTextLiked: {
    color: colors.likePillOnActive,
  },
  pillPressed: {
    opacity: 0.88,
  },
  commentsSectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
  },
  commentsCountLabel: {
    ...typography.meta,
    color: colors.textMuted,
  },
  commentsSortLink: {
    ...typography.meta,
    color: colors.feedTabActive,
    fontWeight: '500',
  },
  emptyLoading: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  commentTapArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minWidth: 0,
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
  commentLikePressable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    marginVertical: -spacing.sm,
    marginRight: -spacing.sm,
  },
  commentLikePressed: {
    opacity: 0.75,
  },
  commentLikeCount: {
    ...typography.meta,
    color: colors.iconPill,
    minWidth: 16,
  },
  commentLikeCountActive: {
    color: colors.likePillActive,
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: commentComposer.rowGap,
  },
  inputShell: {
    flex: 1,
    minWidth: 0,
    minHeight: commentComposer.fieldMinHeight,
    borderWidth: commentComposer.fieldBorderWidth,
    borderColor: commentComposer.fieldBorderColor,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  input: {
    ...typography.body,
    color: colors.textPrimary,
    maxHeight: 120,
    minHeight:
      commentComposer.fieldMinHeight - commentComposer.fieldBorderWidth * 2,
    paddingHorizontal: commentComposer.fieldPaddingHorizontal,
    paddingVertical: commentComposer.fieldTextPaddingVertical,
  },
  sendBtn: {
    flexShrink: 0,
    width: commentComposer.sendHitSize,
    height: commentComposer.sendHitSize,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendPressed: {
    opacity: 0.75,
  },
  sendDisabled: {
    opacity: 0.4,
  },
});
