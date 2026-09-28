import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthRings } from '@/components/auth/auth-rings';
import { EnergyOpsDiagram } from '@/components/auth/energy-ops-diagram';
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
  const titleSize = Math.min(52, Math.round(width * 0.132));

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
              <EnergyOpsDiagram />
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
                  Energy Monitor
                </Text>
              </View>
              <Text style={[styles.title, { color: colors.textOnPage, fontSize: titleSize, lineHeight: titleSize * 1.05 }]}>
                Wyre <Text style={{ color: accent }}>Energy</Text>
                {'\n'}Management
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: isDark ? 'rgba(255,255,255,0.92)' : colors.textOnPageMuted },
                ]}>
                Track and manage your solar, generators, and energy systems across mulitiple
                sites, from one app.
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
    marginTop: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottom: {
    paddingHorizontal: 24,
    position: 'relative',
    overflow: 'visible',
    zIndex: 2,
  },
  watermarkWrap: {
    position: 'absolute',
    top: -60,
    left: -8,
    right: -48,
    zIndex: 0,
  },
  watermark: {
    fontWeight: '800',
  },
  title: {
    fontWeight: '800',
    letterSpacing: -1.2,
    zIndex: 3,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 44,
    fontSize: 17,
    lineHeight: 23,
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
