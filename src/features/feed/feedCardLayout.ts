import { spacing, typography } from '@/src/theme/tokens';

const META_LINE = typography.meta.lineHeight;
const PILL_PAD_Y = spacing.xs + 2;

/** Matches PostCard footer pill row height (padding + meta line). */
export const FEED_CARD_PILL_ROW_HEIGHT = PILL_PAD_Y + META_LINE + PILL_PAD_Y;

/**
 * Fixed vertical slices shared by PostCard and measured skeleton math.
 * Used so header + body + footer sums exactly to a measured card height.
 */
export const FEED_CARD_HEADER_STRIP_HEIGHT = spacing.md + 40 + spacing.md;

export const FEED_CARD_FOOTER_STRIP_HEIGHT = spacing.xs + FEED_CARD_PILL_ROW_HEIGHT + spacing.lg;

export function feedCardMeasuredBodyHeight(totalHeight: number): number {
  const raw = totalHeight - FEED_CARD_HEADER_STRIP_HEIGHT - FEED_CARD_FOOTER_STRIP_HEIGHT;
  return Math.max(0, raw);
}
