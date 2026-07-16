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

import { AUTH_LOGO } from '@/constants/auth-logo';

type SplashLogoHandoffProps = {
  children: (props: { hideLogo: boolean }) => ReactNode;
  /** Skip animation (e.g. returning from forgot-password). */
  skip?: boolean;
  onComplete?: () => void;
};

/**
 * Keeps the native splash logo on screen, then animates that same Wyre wordmark
 * upward into the login header slot before revealing the form.
 */
export function SplashLogoHandoff({
  children,
  skip = false,
  onComplete,
}: SplashLogoHandoffProps) {
  const insets = useSafeAreaInsets();
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;
  const progress = useSharedValue(skip ? 1 : 0);
  const formOpacity = useSharedValue(skip ? 1 : 0);
  const [ready, setReady] = useState(skip);

  const { width: screenW, height: screenH } = Dimensions.get('window');

  const startLeft = (screenW - AUTH_LOGO.splashWidth) / 2;
  const startTop = (screenH - AUTH_LOGO.splashHeight) / 2;
  const endLeft = (screenW - AUTH_LOGO.finalWidth) / 2;
  const endTop = insets.top + AUTH_LOGO.headerOffset;

  useEffect(() => {
    if (skip) {
      SplashScreen.hideAsync().catch(() => undefined);
      return;
    }

    let cancelled = false;

    const finishHandoff = () => {
      setReady(true);
      onCompleteRef.current?.();
    };

    const start = async () => {
      await new Promise((r) => requestAnimationFrame(() => r(null)));
      if (cancelled) return;

      await SplashScreen.hideAsync().catch(() => undefined);
      if (cancelled) return;

      progress.value = withDelay(
        60,
        withTiming(
          1,
          {
            duration: 780,
            easing: Easing.bezier(0.22, 1, 0.36, 1),
          },
          (finished) => {
            if (finished) {
              runOnJS(finishHandoff)();
            }
          },
        ),
      );

      formOpacity.value = withDelay(
        480,
        withTiming(1, { duration: 360, easing: Easing.out(Easing.cubic) }),
      );
    };

    start();

    return () => {
      cancelled = true;
    };
  }, [skip, progress, formOpacity]);

  const flyingStyle = useAnimatedStyle(() => {
    const left = startLeft + (endLeft - startLeft) * progress.value;
    const top = startTop + (endTop - startTop) * progress.value;
    const width =
      AUTH_LOGO.splashWidth +
      (AUTH_LOGO.finalWidth - AUTH_LOGO.splashWidth) * progress.value;
    const height =
      AUTH_LOGO.splashHeight +
      (AUTH_LOGO.finalHeight - AUTH_LOGO.splashHeight) * progress.value;

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

  return (
    <View style={styles.root}>
      <Animated.View style={formStyle}>
        {children({ hideLogo: !ready && !skip })}
      </Animated.View>

      {!skip && !ready ? (
        <Animated.View style={flyingStyle} pointerEvents="none">
          <Image source={AUTH_LOGO.source} style={styles.flyingImage} contentFit="contain" />
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flyingImage: {
    width: '100%',
    height: '100%',
  },
});
