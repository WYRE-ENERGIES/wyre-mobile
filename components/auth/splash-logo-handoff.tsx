import { Image } from 'expo-image';
import * as SplashScreen from 'expo-splash-screen';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BrandedSplash } from '@/components/auth/branded-splash';
import { AUTH_LOGO } from '@/constants/auth-logo';
import { useAppTheme } from '@/context/theme-context';

const HOLD_MS = 1400;
const FLY_MS = 780;

const logoSource = (isDark: boolean) => (isDark ? AUTH_LOGO.sourceDark : AUTH_LOGO.source);

/** Skip the launch splash when returning to Welcome in the same session. */
let splashPlayed = false;

type SplashLogoHandoffProps = {
  children: (props: { hideLogo: boolean }) => ReactNode;
  skip?: boolean;
  onComplete?: () => void;
};

export function SplashLogoHandoff({
  children,
  skip = false,
  onComplete,
}: SplashLogoHandoffProps) {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const skipAnim = skip || splashPlayed;
  const progress = useSharedValue(skipAnim ? 1 : 0);
  const formOpacity = useSharedValue(skipAnim ? 1 : 0);
  const splashOpacity = useSharedValue(skipAnim ? 0 : 1);
  const [ready, setReady] = useState(skipAnim);

  const { width: screenW, height: screenH } = Dimensions.get('window');

  const startLeft = (screenW - AUTH_LOGO.splashWidth) / 2;
  const startTop = (screenH - AUTH_LOGO.splashHeight) / 2;
  const endLeft = 24;
  const endTop = insets.top + AUTH_LOGO.headerOffset;

  useEffect(() => {
    if (skipAnim) {
      SplashScreen.hideAsync().catch(() => undefined);
      return;
    }

    let cancelled = false;

    const finishHandoff = () => {
      splashPlayed = true;
      setReady(true);
      onCompleteRef.current?.();
    };

    const start = async () => {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      if (cancelled) return;

      await SplashScreen.hideAsync().catch(() => undefined);
      if (cancelled) return;

      await new Promise((r) => setTimeout(r, HOLD_MS));
      if (cancelled) return;

      progress.value = withTiming(
        1,
        {
          duration: FLY_MS,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
        },
        (finished) => {
          if (finished) {
            runOnJS(finishHandoff)();
          }
        },
      );

      splashOpacity.value = withTiming(0, { duration: 420, easing: Easing.out(Easing.cubic) });
      formOpacity.value = withDelay(
        280,
        withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) }),
      );
    };

    start();

    return () => {
      cancelled = true;
    };
  }, [skipAnim, progress, formOpacity, splashOpacity]);

  const flyingStyle = useAnimatedStyle(() => {
    const left = startLeft + (endLeft - startLeft) * progress.value;
    const top = startTop + (endTop - startTop) * progress.value;
    const width =
      AUTH_LOGO.splashWidth + (AUTH_LOGO.finalWidth - AUTH_LOGO.splashWidth) * progress.value;
    const height =
      AUTH_LOGO.splashHeight + (AUTH_LOGO.finalHeight - AUTH_LOGO.splashHeight) * progress.value;

    return {
      position: 'absolute' as const,
      left,
      top,
      width,
      height,
      opacity: ready ? 0 : 1,
      zIndex: 20,
    };
  });

  const formStyle = useAnimatedStyle(() => ({
    flex: 1,
    opacity: formOpacity.value,
  }));

  const splashStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    opacity: splashOpacity.value,
    zIndex: 1,
  }));

  return (
    <View style={[styles.root, { backgroundColor: isDark ? '#05010A' : '#F4F2F8' }]}>
      <Animated.View style={splashStyle} pointerEvents="none">
        <BrandedSplash />
      </Animated.View>

      <Animated.View style={formStyle}>{children({ hideLogo: !ready && !skipAnim })}</Animated.View>

      {!skipAnim && !ready ? (
        <Animated.View style={flyingStyle} pointerEvents="none">
          <Image source={logoSource(isDark)} style={styles.flyingImage} contentFit="contain" />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  flyingImage: {
    width: '100%',
    height: '100%',
  },
});
