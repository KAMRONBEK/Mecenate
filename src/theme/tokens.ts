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
  /** Interaction chips — Figma */
  pillBackground: '#F0F2F5',
  paidOverlay: '#F0F2F5',
  paidBorder: '#D1D1D6',
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
