/**
 * Wyre brand tokens and app theme palettes.
 */

import { Platform } from 'react-native';

export const WyreColors = {
  purple: '#5C12A7',
  purpleDark: '#4a0d87',
  purpleDeep: '#4c1d95',
  purpleLight: '#7c3aed',
  purpleMuted: '#8b5cf6',
  purpleBright: '#9D00FF',
  orange: '#F58220',
  orangeBright: '#FFC205',
  orangeGradientEnd: '#ea580c',
  solarAccent: '#fb923c',
  chartYellow: '#FCCC43',
  pageBg: '#F2F2F8',
  surface: '#ffffff',
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  border: '#ececf3',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
};

export type ThemeScheme = 'light' | 'dark';

export type AppPalette = {
  pageBg: string;
  surface: string;
  surfaceMuted: string;
  textPrimary: string;
  textSecondary: string;
  textOnPage: string;
  textOnPageMuted: string;
  textOnAccent: string;
  textOnCard: string;
  textOnCardSecondary: string;
  border: string;
  accent: string;
  accentMuted: string;
  success: string;
  warning: string;
  error: string;
  gradientFrom: string;
  gradientTo: string;
  chartYellow: string;
  tabBarBg: string;
  headerBg: string;
  inputBg: string;
  inputBorder: string;
  overlay: string;
  icon: string;
};

export const Palettes: Record<ThemeScheme, AppPalette> = {
  light: {
    pageBg: '#F2F2F8',
    surface: '#FFFFFF',
    surfaceMuted: '#F5F0FA',
    textPrimary: '#111827',
    textSecondary: '#6B7280',
    textOnPage: '#111827',
    textOnPageMuted: '#6B7280',
    textOnAccent: '#FFFFFF',
    textOnCard: '#111827',
    textOnCardSecondary: '#6B7280',
    border: '#ECECF3',
    accent: WyreColors.purple,
    accentMuted: 'rgba(92, 18, 167, 0.12)',
    success: WyreColors.success,
    warning: WyreColors.warning,
    error: WyreColors.error,
    gradientFrom: '#F2F2F8',
    gradientTo: '#F2F2F8',
    chartYellow: WyreColors.chartYellow,
    tabBarBg: '#FFFFFF',
    headerBg: '#FFFFFF',
    inputBg: '#F5F0FA',
    inputBorder: 'rgba(92, 18, 167, 0.14)',
    overlay: 'rgba(17, 24, 39, 0.4)',
    icon: '#6B7280',
  },
  dark: {
    pageBg: '#0D0517',
    surface: '#17171A',
    surfaceMuted: '#232327',
    textPrimary: '#FFFFFF',
    textSecondary: 'rgba(255, 255, 255, 0.68)',
    textOnPage: '#FFFFFF',
    textOnPageMuted: 'rgba(255, 255, 255, 0.72)',
    textOnAccent: '#FFFFFF',
    textOnCard: '#FFFFFF',
    textOnCardSecondary: 'rgba(255, 255, 255, 0.66)',
    border: 'rgba(255, 255, 255, 0.12)',
    accent: '#9D4EDD',
    accentMuted: 'rgba(157, 78, 221, 0.22)',
    success: WyreColors.success,
    warning: WyreColors.warning,
    error: WyreColors.error,
    gradientFrom: '#1A0B2E',
    gradientTo: '#0D0517',
    chartYellow: WyreColors.chartYellow,
    tabBarBg: '#160A24',
    headerBg: 'transparent',
    inputBg: 'rgba(92, 18, 167, 0.35)',
    inputBorder: 'rgba(255, 255, 255, 0.35)',
    overlay: 'rgba(0, 0, 0, 0.55)',
    icon: '#C4B5D6',
  },
};

const tintColorLight = WyreColors.purple;
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: Palettes.light.textOnPage,
    background: Palettes.light.pageBg,
    tint: tintColorLight,
    icon: Palettes.light.icon,
    tabIconDefault: '#9ca3af',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: Palettes.dark.textOnPage,
    background: Palettes.dark.pageBg,
    tint: tintColorDark,
    icon: Palettes.dark.icon,
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
