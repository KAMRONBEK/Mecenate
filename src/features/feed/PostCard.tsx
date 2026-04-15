import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image } from 'expo-image';
import { memo } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import HeartFilled from '@/assets/svgs/heart.svg';
import HeartOutlined from '@/assets/svgs/heart-outlined.svg';
import MessageIcon from '@/assets/svgs/message.svg';
import type { Post } from '@/src/api/types';
import { colors, radius, spacing, typography } from '@/src/theme/tokens';

/** expo-image blur only — expo-blur + Image crashes on Android when scrolling (expo#24572). */
const PAID_COVER_BLUR_RADIUS = Platform.select({ ios: 44, android: 56, default: 48 });

type Props = {
  post: Post;
};

function PostCardInner({ post }: Props) {
  const { author, preview, coverUrl, likesCount, commentsCount, tier, title } = post;
  const userHasLiked = post.isLiked === true;
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

      {isPaid ? (
        <>
          <View style={styles.paidMedia} accessibilityLabel="Закрытый пост">
            {coverUrl ? (
              <Image
                source={{ uri: coverUrl }}
                style={StyleSheet.absoluteFill}
                recyclingKey={`${post.id}-cover`}
                cachePolicy="memory-disk"
                priority="normal"
                contentFit="cover"
                blurRadius={PAID_COVER_BLUR_RADIUS}
              />
            ) : (
              <View style={[StyleSheet.absoluteFill, styles.paidMediaFallback]} />
            )}
            <View style={styles.paidDimming} pointerEvents="none" />
            <View style={styles.paidOverlay}>
              <View style={styles.paidIconSquare}>
                <View style={styles.paidIconCircle}>
                  <FontAwesome name="dollar" size={18} color={colors.paidAccent} />
                </View>
              </View>
              <Text style={styles.paidLine1}>Контент скрыт пользователем.</Text>
              <Text style={styles.paidLine2}>Доступ откроется после доната</Text>
              <Pressable
                style={({ pressed }) => [styles.paidCta, pressed && styles.paidCtaPressed]}
                accessibilityRole="button"
                accessibilityLabel="Отправить донат"
              >
                <Text style={styles.paidCtaLabel}>Отправить донат</Text>
              </Pressable>
            </View>
          </View>
          <View style={styles.skeletonBlock}>
            <View style={styles.skeletonLineShort} />
            <View style={styles.skeletonLineLong} />
          </View>
        </>
      ) : (
        <>
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
            {title ? (
              <Text style={styles.postTitle} numberOfLines={2}>
                {title}
              </Text>
            ) : null}
            <Text style={styles.preview} numberOfLines={3}>
              {preview}
            </Text>
          </View>
        </>
      )}

      <View style={styles.footer}>
        <View style={[styles.pill, userHasLiked && styles.pillLiked]}>
          {userHasLiked ? (
            <HeartFilled width={17} height={15} color={colors.likePillOnActive} accessibilityLabel="Лайки" />
          ) : (
            <HeartOutlined width={17} height={15} color={colors.iconPill} accessibilityLabel="Лайки" />
          )}
          <Text style={[styles.pillText, userHasLiked && styles.pillTextLiked]}>{likesCount}</Text>
        </View>
        <View style={styles.pill}>
          <MessageIcon width={15} height={15} color={colors.iconPill} accessibilityLabel="Комментарии" />
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
  paidMedia: {
    width: '100%',
    aspectRatio: 4 / 3,
    overflow: 'hidden',
    backgroundColor: colors.border,
  },
  paidMediaFallback: {
    backgroundColor: '#2C2C3A',
  },
  paidDimming: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.paidDimOverlay,
  },
  paidOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  paidIconSquare: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.paidAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paidIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.paidOverlayText,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paidLine1: {
    ...typography.body,
    fontWeight: '500',
    color: colors.paidOverlayText,
    textAlign: 'center',
  },
  paidLine2: {
    ...typography.caption,
    color: colors.paidOverlayText,
    textAlign: 'center',
    opacity: 0.95,
  },
  paidCta: {
    alignSelf: 'stretch',
    maxWidth: 320,
    width: '100%',
    backgroundColor: colors.paidAccent,
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paidCtaPressed: {
    opacity: 0.88,
  },
  paidCtaLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.paidOverlayText,
  },
  skeletonBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  skeletonLineShort: {
    height: 12,
    width: '42%',
    borderRadius: radius.full,
    backgroundColor: colors.paidSkeleton,
  },
  skeletonLineLong: {
    height: 12,
    width: '92%',
    borderRadius: radius.full,
    backgroundColor: colors.paidSkeleton,
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
});
