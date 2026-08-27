import { Image } from 'expo-image';
import { StyleSheet, type ImageStyle, type StyleProp } from 'react-native';

import { AUTH_LOGO } from '@/constants/auth-logo';
import { useAppTheme } from '@/context/theme-context';

type WyreWordmarkProps = {
  width?: number;
  height?: number;
  style?: StyleProp<ImageStyle>;
};

export function WyreWordmark({
  width = AUTH_LOGO.finalWidth,
  height = AUTH_LOGO.finalHeight,
  style,
}: WyreWordmarkProps) {
  const { isDark } = useAppTheme();

  return (
    <Image
      source={isDark ? AUTH_LOGO.sourceDark : AUTH_LOGO.source}
      style={[styles.logo, { width, height }, style]}
      contentFit="contain"
    />
  );
}

const styles = StyleSheet.create({
  logo: {
    width: AUTH_LOGO.finalWidth,
    height: AUTH_LOGO.finalHeight,
  },
});
