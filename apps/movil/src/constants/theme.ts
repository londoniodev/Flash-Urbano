export const COLORS = {
  light: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    primary: '#10B981',
    primaryMuted: '#D1FAE5',
    danger: '#EF4444',
    dangerMuted: '#FEE2E2',
    warning: '#F59E0B',
    warningMuted: '#FEF3C7',
    text: '#0A0A0A',
    textMuted: '#6B7280',
    textInverse: '#FAFAFA',
    border: '#E5E7EB',
    overlay: 'rgba(0,0,0,0.5)',
  },
  dark: {
    background: '#0A0A0A',
    surface: '#141414',
    primary: '#34D399',
    primaryMuted: '#064E3B',
    danger: '#F87171',
    dangerMuted: '#7F1D1D',
    warning: '#FBBF24',
    warningMuted: '#78350F',
    text: '#FAFAFA',
    textMuted: '#9CA3AF',
    textInverse: '#0A0A0A',
    border: '#1F1F1F',
    overlay: 'rgba(0,0,0,0.7)',
  },
} as const;

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  display: 48,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  sm: 6,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export type ThemeMode = 'light' | 'dark';

export function getColors(mode: ThemeMode) {
  return COLORS[mode];
}
