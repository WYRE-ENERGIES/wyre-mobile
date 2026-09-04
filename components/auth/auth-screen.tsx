import { ReactNode, useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthBackdrop } from '@/components/auth/auth-backdrop';

type AuthScreenProps = {
  children: ReactNode;
  footer?: ReactNode;
  hideLogo?: boolean;
  showHouse?: boolean;
  contentGap?: number;
  contentPosition?: 'center' | 'flex-end';
};

export function AuthScreen({
  children,
  footer,
  hideLogo = false,
  showHouse = true,
  contentGap = 20,
  contentPosition = 'flex-end',
}: AuthScreenProps) {
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
    <AuthBackdrop hideLogo={hideLogo} showHouse={!keyboardOpen && showHouse}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View
          style={[
            styles.formArea,
            {
              justifyContent: keyboardOpen ? 'flex-start' : contentPosition,
              paddingTop: keyboardOpen ? 8 : 0,
              paddingBottom: Math.max(insets.bottom, 24) + 12,
            },
          ]}>
          <View style={[styles.card, { gap: contentGap }]}>{children}</View>
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </KeyboardAvoidingView>
    </AuthBackdrop>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  formArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
