import { LinearGradient } from 'expo-linear-gradient';
import { type ReactNode } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { AuthRings } from '@/components/auth/auth-rings';
import { useAppTheme } from '@/context/theme-context';

const DARK_FROM = '#1A082E';
const DARK_TO = '#05010A';
const LIGHT_BG = '#F4F2F8';

type BrandedSplashProps = {
  /** When true, this is a static preview (logo stays in the center). */
  showLogo?: boolean;
  children?: ReactNode;
};

export function BrandedSplash({ showLogo = false, children }: BrandedSplashProps) {
  const { isDark } = useAppTheme();
  const { width, height } = useWindowDimensions();
  const watermarkSize = Math.round(width * 0.26);

  const watermark = (
    <View
      pointerEvents="none"
      style={[styles.watermarkWrap, { top: height * 0.61 }]}>
      {['Solar', 'Monitor'].map((line) => (
        <Text
          key={line}
          numberOfLines={1}
          style={[
            styles.watermark,
            {
              fontSize: watermarkSize,
              lineHeight: watermarkSize * 1.04,
              color: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(17,24,39,0.08)',
            },
          ]}>
          {line}
        </Text>
      ))}
    </View>
  );

  const body = (
    <View style={styles.fill}>
      <AuthRings />
      {watermark}
      {showLogo || children ? <View style={styles.logoCenter}>{children}</View> : null}
    </View>
  );

  if (isDark) {
    return (
      <LinearGradient colors={[DARK_FROM, DARK_TO]} style={styles.fill}>
        {body}
      </LinearGradient>
    );
  }

  return <View style={[styles.fill, { backgroundColor: LIGHT_BG }]}>{body}</View>;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
    overflow: 'hidden',
  },
  logoCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  watermarkWrap: {
    position: 'absolute',
    left: 6,
    width: '125%',
    zIndex: 0,
  },
  watermark: {
    fontWeight: '800',
    includeFontPadding: false,
  },
});
