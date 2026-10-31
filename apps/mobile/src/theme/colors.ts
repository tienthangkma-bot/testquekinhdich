import { colors as baseColors } from '@kindich/shared';

export const imperialIvoryTheme = {
  colors: {
    ...baseColors,
    primary: baseColors.crimson[700],      // #851616 Đỏ sẫm chủ đạo
    primaryLight: baseColors.crimson[50],  // Nền đỏ nhạt
    accent: baseColors.gold[600],          // #B88E28 Vàng kim
    accentLight: baseColors.gold[50],      // Nền vàng nhạt
    background: baseColors.background.base,// #FAF8F5 Nền giấy xuyến chỉ
    backgroundSubtle: baseColors.background.subtle, // #F2EFE9
    backgroundMuted: baseColors.background.muted,   // #EAE5DC
    card: baseColors.background.surface,   // #FFFFFF Nền thẻ
    border: baseColors.border.base,        // #E0D8CB Viền nhạt
    borderGold: baseColors.border.gold,    // #D6B462 Viền vàng
    text: baseColors.text.primary,         // #1F1916 Chữ chính
    textSecondary: baseColors.text.secondary, // #594F48 Chữ phụ
    textMuted: baseColors.text.muted,      // #8C8178 Chữ mờ
    white: '#FFFFFF',
    dark: '#1A1A1A',
    success: '#2E7D32',
    warning: '#ED6C02',
    danger: '#D32F2F',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999,
  },
};

export const darkMysticTheme = {
  colors: {
    ...baseColors,
    primary: '#C9A227',
    primaryLight: 'rgba(201, 162, 39, 0.15)',
    accent: '#C9A227',
    accentLight: 'rgba(201, 162, 39, 0.10)',
    background: '#0B0F1A',
    backgroundSubtle: '#1A2332',
    backgroundMuted: '#222D40',
    card: '#151B2B',
    border: 'rgba(255, 255, 255, 0.10)',
    borderGold: '#C9A227',
    text: '#E8EDF5',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    white: '#FFFFFF',
    dark: '#0B0F1A',
    success: '#34D399',
    warning: '#FBBF24',
    danger: '#F87171',
    blue: '#60A5FA',
  },
  spacing: imperialIvoryTheme.spacing,
  radius: imperialIvoryTheme.radius,
};

export const theme = imperialIvoryTheme;
