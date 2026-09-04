import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WyreWordmark } from '@/components/auth/wyre-wordmark';
import { AUTH_LOGO } from '@/constants/auth-logo';
import { useAppTheme } from '@/context/theme-context';
import { AuthRings } from "./auth-rings";

type AuthBackdropProps = {
  children: ReactNode;
  showHouse?: boolean;
  hideLogo?: boolean;
  logoAlign?: 'left' | 'center';
};

export function AuthBackdrop({
  children,
  showHouse = false,
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

      {showHouse ? (
        <View style={[styles.hero, { height: width * 1.03 }]}>
          <Image
            source={require('@/assets/images/solar-house.png')}
            style={styles.house}
            contentFit="contain"
            contentPosition="bottom"
          />
          <LinearGradient
            colors={
              isDark
                ? ['transparent', 'rgba(5, 1, 10, 0.67)', '#05010A']
                : ['transparent', colors.pageBg]
            }
            locations={isDark ? [0.55, 0.88, 1] : [0.55, 1]}
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
    marginTop: 0,
    overflow: 'hidden',
  },
  house: {
    width: '100%',
    height: '100%',
    marginTop: -20,
    alignSelf: 'center',
  },
  heroFade: {
    position: 'absolute',
    right: 0,
    bottom: 20,
    left: 0,
    height: '26%',
  },
  children: {
    flex: 1,
  },
});
