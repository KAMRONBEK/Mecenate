import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/src/theme/tokens';

/** Match PostCard free layout when no measured height yet. */
const NAME_LINE = typography.title.lineHeight;
const TITLE_LINE = typography.postTitle.lineHeight;
const BODY_LINE = typography.body.lineHeight;
const META_LINE = typography.meta.lineHeight;
const PILL_PAD_Y = spacing.xs + 2;
const PILL_HEIGHT = PILL_PAD_Y + META_LINE + PILL_PAD_Y;

type Props = {
  /** From first post `onLayout` — skeleton row matches that height to avoid scroll jump. */
  targetHeight?: number | null;
};

function MeasuredSkeleton({ height }: { height: number }) {
  return (
    <View
      style={[styles.card, { height }]}
      accessibilityRole="progressbar"
      accessibilityLabel="Загрузка публикации"
    >
      <View style={styles.header}>
        <View style={styles.avatar} />
        <View style={styles.nameBar} />
      </View>
      <View style={styles.bodyMeasured} />
      <View style={styles.footer}>
        <View style={styles.pill} />
        <View style={styles.pill} />
      </View>
    </View>
  );
}

function IntrinsicSkeleton() {
  return (
    <View style={styles.card} accessibilityRole="progressbar" accessibilityLabel="Загрузка публикации">
      <View style={styles.header}>
        <View style={styles.avatar} />
        <View style={styles.nameBar} />
      </View>
      <View style={styles.cover} />
      <View style={styles.textBlock}>
        <View style={styles.titlePlaceholder} />
        <View style={styles.previewLines}>
          <View style={[styles.previewLine, { width: '92%' }]} />
          <View style={[styles.previewLine, { width: '88%' }]} />
          <View style={[styles.previewLine, { width: '95%' }]} />
        </View>
      </View>
      <View style={styles.footer}>
        <View style={styles.pill} />
        <View style={styles.pill} />
      </View>
    </View>
  );
}

function PostCardSkeletonInner({ targetHeight }: Props) {
  if (targetHeight != null && targetHeight > 0) {
    return <MeasuredSkeleton height={targetHeight} />;
  }
  return <IntrinsicSkeleton />;
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
    height: NAME_LINE,
    flex: 1,
    maxWidth: 160,
    borderRadius: radius.full,
    backgroundColor: colors.skeleton,
  },
  bodyMeasured: {
    flex: 1,
    minHeight: 0,
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
    gap: spacing.xs,
  },
  titlePlaceholder: {
    height: TITLE_LINE,
    width: '48%',
    borderRadius: radius.full,
    backgroundColor: colors.skeleton,
  },
  previewLines: {
    gap: 0,
  },
  previewLine: {
    height: BODY_LINE,
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
    height: PILL_HEIGHT,
    borderRadius: radius.full,
    backgroundColor: colors.skeleton,
  },
});
