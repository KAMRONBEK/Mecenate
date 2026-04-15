import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image, StyleSheet, Text, View } from 'react-native';

import type { Post } from '@/src/api/types';
import { colors, radius, spacing, typography } from '@/src/theme/tokens';

type Props = {
  post: Post;
};

export function PostCard({ post }: Props) {
  const { author, preview, coverUrl, likesCount, commentsCount, tier, title } = post;
  const isPaid = tier === 'paid';
  const name = author.displayName || author.username;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: author.avatarUrl }} style={styles.avatar} accessibilityIgnoresInvertColors />
        <View style={styles.headerText}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {title ? (
            <Text style={styles.title} numberOfLines={2}>
              {title}
            </Text>
          ) : null}
        </View>
      </View>

      {isPaid ? (
        <View style={styles.paidBox} accessibilityLabel="Закрытый пост для подписчиков">
          <FontAwesome name="lock" size={16} color={colors.textMuted} />
          <Text style={styles.paidText}>Закрытый пост для подписчиков</Text>
        </View>
      ) : (
        <Text style={styles.preview} numberOfLines={4}>
          {preview}
        </Text>
      )}

      {coverUrl ? (
        <Image
          source={{ uri: coverUrl }}
          style={styles.cover}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      ) : null}

      <View style={styles.meta}>
        <View style={styles.metaItem}>
          <FontAwesome name="heart" size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>{likesCount}</Text>
        </View>
        <View style={styles.metaItem}>
          <FontAwesome name="comment" size={14} color={colors.textMuted} />
          <Text style={styles.metaText}>{commentsCount}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.border,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    ...typography.title,
    color: colors.textPrimary,
  },
  title: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  preview: {
    ...typography.body,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  paidBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.paidOverlay,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.paidBorder,
    marginBottom: spacing.md,
  },
  paidText: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
  },
  cover: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: radius.md,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    ...typography.meta,
    color: colors.textSecondary,
  },
});
