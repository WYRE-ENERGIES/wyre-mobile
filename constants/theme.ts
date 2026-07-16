/**
 * Wyre brand tokens and app theme colors.
 */

import { Platform } from 'react-native';

export const WyreColors = {
  purple: '#5C12A7',
  purpleDark: '#4a0d87',
  purpleDeep: '#4c1d95',
  purpleLight: '#7c3aed',
  purpleMuted: '#8b5cf6',
  orange: '#F58220',
  orangeBright: '#FFC205',
  orangeGradientEnd: '#ea580c',
  solarAccent: '#fb923c',
  pageBg: '#F2F2F8',
  surface: '#ffffff',
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  border: '#ececf3',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
};

const tintColorLight = WyreColors.purple;
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: WyreColors.textPrimary,
    background: WyreColors.surface,
    tint: tintColorLight,
    icon: WyreColors.textSecondary,
    tabIconDefault: '#9ca3af',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
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
