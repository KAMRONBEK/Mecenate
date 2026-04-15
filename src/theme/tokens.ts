/**
 * Design tokens — align spacing/typography with Figma "Test Assignment" feed.
 */
export const colors = {
  /** Screen background — Figma feed canvas */
  background: '#F5F7FA',
  surface: '#FFFFFF',
  textPrimary: '#111111',
  /** Body / preview — dark gray */
  textSecondary: '#3C3C43',
  textMuted: '#8E8E93',
  border: '#E5E5EA',
  accent: '#007AFF',
  /** Feed tier tabs — active segment (Figma) */
  feedTabActive: '#6115CD',
  /** Pills: default icon + label (SVG) */
  iconPill: '#57626F',
  /** Liked like pill — outer background */
  likePillActive: '#FF2B75',
  likePillOnActive: '#FFFFFF',
  /** Interaction chips — Figma */
  pillBackground: '#F0F2F5',
  paidOverlay: '#F0F2F5',
  paidBorder: '#D1D1D6',
  /** Paid / donation CTA — Figma lock card */
  paidAccent: '#6219D1',
  paidSkeleton: '#F0F0F0',
  /** Feed loading placeholders (skeleton screens) */
  skeleton: '#E8EBEF',
  paidOverlayText: '#FFFFFF',
  /** Dark overlay on locked post media */
  paidDimOverlay: 'rgba(0,0,0,0.52)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  /** Post card — Figma ~16–20 */
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

/**
 * Post detail comment field + send (Figma Test Assignment — comment composer).
 * Specs: 48px-tall pill, 1px #E5E5EA stroke, 16px horizontal inset, 8px gap to send, send icon active/disabled.
 */
export const commentComposer = {
  fieldMinHeight: 48,
  fieldBorderWidth: 1,
  fieldBorderColor: '#E5E5EA',
  fieldPaddingHorizontal: 16,
  /** Vertical padding so 15/21 text sits optically centered in 48px (incl. border). */
  fieldTextPaddingVertical: 12,
  rowGap: 8,
  sendIcon: {
    width: 20,
    height: 17,
    /** Has text, send enabled */
    colorActive: '#6115CD' as const,
    /** Empty / sending — disabled */
    colorDisabled: '#D5C9FF' as const,
  },
  /** Minimum touch target; icon stays visually centered inside. */
  sendHitSize: 44,
} as const;

export const typography = {
  /** Screen title "Лента" */
  screenTitle: { fontSize: 28, fontWeight: '700' as const, lineHeight: 34, letterSpacing: -0.5 },
  /** Author name */
  title: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
  /** Post title under media */
  postTitle: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 21 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  meta: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
} as const;
