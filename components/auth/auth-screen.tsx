import { Image } from 'expo-image';
import { ReactNode, useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AUTH_LOGO } from '@/constants/auth-logo';

type AuthScreenProps = {
  children: ReactNode;
  footer?: ReactNode;
  /** Hide the static header logo (used while the flying splash logo animates in). */
  hideLogo?: boolean;
};

export function AuthScreen({ children, footer, hideLogo = false }: AuthScreenProps) {
  const insets = useSafeAreaInsets();
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSub = Keyboard.addListener(showEvent, () => setKeyboardOpen(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardOpen(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <View style={styles.root}>
      <View style={[styles.logoHeader, { paddingTop: insets.top + AUTH_LOGO.headerOffset }]}>
        {hideLogo ? (
          <View style={styles.logoSlot} />
        ) : (
          <Image source={AUTH_LOGO.source} style={styles.logo} contentFit="contain" />
        )}
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={[
            styles.formArea,
            {
              justifyContent: keyboardOpen ? 'flex-start' : 'center',
              paddingTop: keyboardOpen ? 8 : 0,
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}>
          <View style={styles.card}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  logoHeader: {
    alignItems: 'center',
    zIndex: 2,
  },
  logoSlot: {
    width: AUTH_LOGO.finalWidth,
    height: AUTH_LOGO.finalHeight,
  },
  logo: {
    width: AUTH_LOGO.finalWidth,
    height: AUTH_LOGO.finalHeight,
  },
  formArea: {
    flex: 1,
    paddingHorizontal: 28,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    gap: 20,
  },
  footer: {
    marginTop: 28,
    alignItems: 'center',
  },
});
