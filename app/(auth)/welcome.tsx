import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthRings } from "@/components/auth/auth-rings";
import { SplashLogoHandoff } from '@/components/auth/splash-logo-handoff';
import { WyreWordmark } from '@/components/auth/wyre-wordmark';
import { AUTH_LOGO } from '@/constants/auth-logo';
import { useAppTheme } from '@/context/theme-context';

const DARK_FROM = '#05010A';
const DARK_TO = '#07010C';
const LIGHT_BG = '#F4F2F8';
const ACCENT_DARK = '#6e11cb'
const ACCENT_LIGHT = '#5C12A7'

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const { colors, isDark } = useAppTheme();
  const accent = isDark ? ACCENT_DARK : ACCENT_LIGHT;
  const watermarkSize = Math.round(width * 0.27);

  return (
    <SplashLogoHandoff>
      {({ hideLogo }) => {
        const screen = (
          <View style={styles.fill}>
            <AuthRings />

            <View
              style={[
                styles.logoRow,
                { paddingTop: insets.top + AUTH_LOGO.headerOffset },
              ]}>
              {hideLogo ? (
                <View style={styles.logoSlot} />
              ) : (
                <Pressable
                  onLongPress={() => {
                    if (__DEV__) router.push('/(auth)/splash');
                  }}
                  delayLongPress={350}>
                  <WyreWordmark />
                </Pressable>
              )}
            </View>

            <View style={styles.hero}>
              <Image
                source={require('@/assets/images/solar-house.png')}
                style={styles.house}
                contentFit="contain"
                contentPosition="bottom"
              />
              <LinearGradient
                colors={isDark ? ['transparent', 'rgba(7, 1, 12, 0.29)', DARK_TO] : ['transparent', LIGHT_BG]}
                locations={isDark ? [0.2, 0.72, 1] : [0.45, 1]}
                style={styles.heroFade}
              />
            </View>

            <View style={[styles.bottom, { paddingBottom: Math.max(insets.bottom, 12) + 10 }]}>
              <View pointerEvents="none" style={styles.watermarkWrap}>
                <Text
                  style={[
                    styles.watermark,
                    {
                      fontSize: watermarkSize,
                      lineHeight: watermarkSize * 1.02,
                      color: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(17,24,39,0.065)',
                    },
                  ]}>
                  Solar Monitor
                </Text>
              </View>
              <Text style={[styles.title, { color: colors.textOnPage }]}>
                Wyre <Text style={{ color: accent }}>Solar</Text>
                {'\n'}Monitoring
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: isDark ? 'rgba(255,255,255,0.92)' : colors.textOnPageMuted },
                ]}>
                Solar monitoring systems gather data from various sensors and meters installed
                within the solar PV system.
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Get Started"
                onPress={() => router.push('/(auth)/login')}
                style={({ pressed }) => [
                  styles.cta,
                  { backgroundColor: accent },
                  pressed && styles.pressed,
                ]}>
                <Text style={styles.ctaLabel}>Get Started</Text>
              </Pressable>
            </View>
          </View>
        );

        if (isDark) {
          return (
            <LinearGradient
              colors={[DARK_FROM, '#1A082E', DARK_TO]}
              locations={[0, 0.48, 1]}
              style={styles.root}>
              {screen}
            </LinearGradient>
          );
        }

        return <View style={[styles.root, { backgroundColor: LIGHT_BG }]}>{screen}</View>;
      }}
    </SplashLogoHandoff>
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
  hero: {
    flex: 1,
    width: '100%',
    marginTop: 0,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  house: {
    width: '108%',
    height: '100%',
    alignSelf: 'center',
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '42%',
  },
  bottom: {
    paddingHorizontal: 24,
    paddingTop: '10%',
    position: 'relative',
    overflow: 'visible',
    zIndex: 2,
  },
  watermarkWrap: {
    position: 'absolute',
    top: -10,
    left: -8,
    right: -48,
    zIndex: 0,
  },
  watermark: {
    fontWeight: '800',
  },
  title: {
    fontSize: 55,
    fontWeight: '800',
    letterSpacing: -1.2,
    zIndex: 3,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 44,
    fontSize: 18,
    lineHeight: 24,
    maxWidth: '95%',
    zIndex: 1,
  },
  cta: {
    marginTop: 22,
    minHeight: 58,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.88,
  },
});
