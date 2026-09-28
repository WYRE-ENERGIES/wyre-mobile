import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EnergyOpsDiagram } from '@/components/auth/energy-ops-diagram';
import { WyreWordmark } from '@/components/auth/wyre-wordmark';
import { AUTH_LOGO } from '@/constants/auth-logo';
import { useAppTheme } from '@/context/theme-context';
import { AuthRings } from "./auth-rings";

type AuthBackdropProps = {
  children: ReactNode;
  showDiagram?: boolean;
  hideLogo?: boolean;
  logoAlign?: 'left' | 'center';
};

export function AuthBackdrop({
  children,
  showDiagram = false,
  hideLogo = false,
  logoAlign = 'left',
}: AuthBackdropProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors, isDark } = useAppTheme();

  const content = (
    <View style={styles.fill}>
      <AuthRings />

      <View style={[styles.logoRow, { paddingTop: insets.top + AUTH_LOGO.headerOffset }]}>
        {hideLogo ? (
          <View style={styles.logoSlot} />
        ) : (
          <View style={logoAlign === 'center' ? styles.logoCenter : undefined}>
            <WyreWordmark />
          </View>
        )}
      </View>

      {showDiagram ? (
        <View style={[styles.hero, { height: Math.min(width * 0.68, 280) }]}>
          <EnergyOpsDiagram tone="backdrop" />
          <LinearGradient
            colors={
              isDark
                ? ['transparent', 'rgba(5, 1, 10, 0.55)', '#05010A']
                : ['transparent', colors.pageBg]
            }
            locations={isDark ? [0.5, 0.86, 1] : [0.5, 1]}
            style={styles.heroFade}
          />
        </View>
      ) : null}

      <View style={styles.children}>{children}</View>
    </View>
  );

  if (!isDark) {
    return <View style={[styles.root, { backgroundColor: colors.pageBg }]}>{content}</View>;
  }

  return (
    <LinearGradient
      colors={['#05010A', '#1A082E', '#07010C']}
      locations={[0, 0.48, 1]}
      style={styles.root}>
      {content}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  logoRow: {
    paddingHorizontal: 24,
    zIndex: 2,
  },
  logoSlot: {
    width: AUTH_LOGO.finalWidth,
    height: AUTH_LOGO.finalHeight,
  },
  logoCenter: {
    alignSelf: 'center',
  },
  hero: {
    width: '100%',
    marginTop: 4,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroFade: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    left: 0,
    height: '28%',
  },
  children: {
    flex: 1,
  },
});
