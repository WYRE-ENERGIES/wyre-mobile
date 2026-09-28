import { router } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { BrandedSplash } from '@/components/auth/branded-splash';
import { WyreWordmark } from '@/components/auth/wyre-wordmark';
import { AUTH_LOGO } from '@/constants/auth-logo';

/** Static preview of the launch splash. Open from Welcome (long-press the logo in dev). */
export default function SplashPreviewScreen() {
  return (
    <Pressable style={styles.fill} onPress={() => router.back()}>
      <BrandedSplash showLogo>
        <WyreWordmark width={AUTH_LOGO.splashWidth} height={AUTH_LOGO.splashHeight} />
      </BrandedSplash>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
