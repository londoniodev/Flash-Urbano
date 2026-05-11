// Flash Urbano Brand Colors — extracted from logo
// Primary Orange: #F47216 (rayo/bolt)
// Dark background with warm undertones to complement orange

export const COLORS = {
  light: {
    background: '#F5F5F0',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    primary: '#F47216',
    primaryLight: '#FFF0E0',
    primaryMuted: '#FDDCB5',
    accent: '#E8650C',
    danger: '#DC2626',
    dangerMuted: '#FEE2E2',
    success: '#16A34A',
    successMuted: '#DCFCE7',
    warning: '#D97706',
    warningMuted: '#FEF3C7',
    info: '#3B82F6',
    infoMuted: '#DBEAFE',
    text: '#1A1A1A',
    textMuted: '#71717A',
    textInverse: '#FFFFFF',
    border: '#E4E4E7',
    borderLight: '#F4F4F5',
    overlay: 'rgba(0,0,0,0.5)',
  },
  dark: {
    background: '#0C0C0E',
    surface: '#18181B',
    surfaceElevated: '#1E1E22',
    primary: '#F47216',
    primaryLight: '#2A1A08',
    primaryMuted: '#3D2510',
    accent: '#FF8A3D',
    danger: '#EF4444',
    dangerMuted: '#451A1A',
    success: '#22C55E',
    successMuted: '#14331F',
    warning: '#F59E0B',
    warningMuted: '#3D2B08',
    info: '#60A5FA',
    infoMuted: '#1E293B',
    text: '#FAFAFA',
    textMuted: '#A1A1AA',
    textInverse: '#0C0C0E',
    border: '#27272A',
    borderLight: '#1E1E22',
    overlay: 'rgba(0,0,0,0.75)',
  },
} as const;

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 22,
  xxl: 28,
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
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export type ThemeMode = 'light' | 'dark';

export function getColors(mode: ThemeMode) {
  return COLORS[mode];
}
