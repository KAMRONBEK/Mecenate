/**
 * Design tokens — align spacing/typography with Figma "Test Assignment" feed.
 */
export const colors = {
  background: '#F5F5F7',
  surface: '#FFFFFF',
  textPrimary: '#111111',
  textSecondary: '#6B6B6B',
  textMuted: '#8E8E93',
  border: '#E5E5EA',
  accent: '#007AFF',
  paidOverlay: '#F2F2F7',
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
  lg: 16,
  full: 9999,
} as const;

export const typography = {
  title: { fontSize: 17, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  meta: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
} as const;
