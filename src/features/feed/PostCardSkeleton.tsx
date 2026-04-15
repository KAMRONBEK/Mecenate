import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '@/src/theme/tokens';

function PostCardSkeletonInner() {
  return (
    <View style={styles.card} accessibilityRole="progressbar" accessibilityLabel="Загрузка публикации">
      <View style={styles.header}>
        <View style={styles.avatar} />
        <View style={styles.nameBar} />
      </View>
      <View style={styles.cover} />
      <View style={styles.textBlock}>
        <View style={styles.lineShort} />
        <View style={styles.lineLong} />
      </View>
      <View style={styles.footer}>
        <View style={styles.pill} />
        <View style={styles.pill} />
      </View>
    </View>
  );
}

export const PostCardSkeleton = memo(PostCardSkeletonInner);

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
    backgroundColor: colors.skeleton,
  },
  nameBar: {
    height: 14,
    flex: 1,
    maxWidth: 160,
    borderRadius: radius.full,
    backgroundColor: colors.skeleton,
  },
  cover: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: colors.skeleton,
  },
  textBlock: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  lineShort: {
    height: 12,
    width: '42%',
    borderRadius: radius.full,
    backgroundColor: colors.skeleton,
  },
  lineLong: {
    height: 12,
    width: '92%',
    borderRadius: radius.full,
    backgroundColor: colors.skeleton,
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
    width: 72,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.skeleton,
  },
});
