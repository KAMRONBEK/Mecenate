import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  feedCardMeasuredBodyHeight,
  FEED_CARD_FOOTER_STRIP_HEIGHT,
  FEED_CARD_HEADER_STRIP_HEIGHT,
  FEED_CARD_PILL_ROW_HEIGHT,
} from '@/src/features/feed/feedCardLayout';
import { colors, radius, spacing, typography } from '@/src/theme/tokens';

/** Intrinsic fallback when no anchor height yet. */
const NAME_LINE = typography.title.lineHeight;
const TITLE_LINE = typography.postTitle.lineHeight;
const BODY_LINE = typography.body.lineHeight;

type Props = {
  /** From last post `onLayout` — must match the row that will sit above the next page. */
  targetHeight?: number | null;
};

function MeasuredSkeleton({ height }: { height: number }) {
  const bodyH = feedCardMeasuredBodyHeight(height);
  return (
    <View
      style={[styles.card, { height }]}
      accessibilityRole="progressbar"
      accessibilityLabel="Загрузка публикации"
    >
      <View style={styles.headerMeasured}>
        <View style={styles.avatar} />
        <View style={styles.nameBar} />
      </View>
      <View style={[styles.bodyMeasured, { height: bodyH }]} />
      <View style={styles.footerMeasured}>
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
  /** Intrinsic skeleton — same padding as PostCard header. */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
  },
  /** Fixed strip — must match `FEED_CARD_HEADER_STRIP_HEIGHT` / PostCard header footprint. */
  headerMeasured: {
    height: FEED_CARD_HEADER_STRIP_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
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
  /** Fixed strip — must match `FEED_CARD_FOOTER_STRIP_HEIGHT` / PostCard footer footprint. */
  footerMeasured: {
    height: FEED_CARD_FOOTER_STRIP_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  pill: {
    width: 72,
    height: FEED_CARD_PILL_ROW_HEIGHT,
    borderRadius: radius.full,
    backgroundColor: colors.skeleton,
  },
});
