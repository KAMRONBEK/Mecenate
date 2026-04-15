import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Post } from '@/src/api/types';
import { colors, radius, spacing, typography } from '@/src/theme/tokens';

type Props = {
  post: Post;
};

function PostCardInner({ post }: Props) {
  const { author, preview, coverUrl, likesCount, commentsCount, tier, title } = post;
  const isPaid = tier === 'paid';
  const name = author.displayName || author.username;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image
          source={{ uri: author.avatarUrl }}
          style={styles.avatar}
          recyclingKey={`${post.id}-avatar`}
          cachePolicy="memory-disk"
          priority="low"
          contentFit="cover"
        />
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      </View>

      {coverUrl ? (
        <Image
          source={{ uri: coverUrl }}
          style={styles.cover}
          recyclingKey={`${post.id}-cover`}
          cachePolicy="memory-disk"
          priority="normal"
          contentFit="cover"
        />
      ) : null}

      <View style={styles.textBlock}>
        {isPaid ? (
          <View style={styles.paidBox} accessibilityLabel="Закрытый пост для подписчиков">
            <FontAwesome name="lock" size={16} color={colors.textMuted} />
            <Text style={styles.paidText}>Этот контент доступен только для подписчиков</Text>
          </View>
        ) : (
          <>
            {title ? (
              <Text style={styles.postTitle} numberOfLines={2}>
                {title}
              </Text>
            ) : null}
            <Text style={styles.preview} numberOfLines={3}>
              {preview}
            </Text>
          </>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.pill}>
          <FontAwesome name="heart-o" size={15} color={colors.textMuted} />
          <Text style={styles.pillText}>{likesCount}</Text>
        </View>
        <View style={styles.pill}>
          <FontAwesome name="comment-o" size={15} color={colors.textMuted} />
          <Text style={styles.pillText}>{commentsCount}</Text>
        </View>
      </View>
    </View>
  );
}

export const PostCard = memo(PostCardInner);

const styles = StyleSheet.create({
  card: {
    width: '100%',
    alignSelf: 'stretch',
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderRadius: radius.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
  },
  name: {
    ...typography.title,
    color: colors.textPrimary,
    flex: 1,
    minWidth: 0,
  },
  cover: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: colors.border,
  },
  textBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.xs,
  },
  postTitle: {
    ...typography.postTitle,
    color: colors.textPrimary,
  },
  preview: {
    ...typography.body,
    color: colors.textSecondary,
  },
  paidBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.paidOverlay,
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.paidBorder,
  },
  paidText: {
    ...typography.body,
    color: colors.textMuted,
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.xs,
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
  pillText: {
    ...typography.meta,
    color: colors.textSecondary,
  },
});
