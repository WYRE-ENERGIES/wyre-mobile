import { ReactNode } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/wyre/app-header';
import { UserAvatarButton } from '@/components/wyre/user-avatar-button';
import { SCREEN_PADDING_H, SCREEN_PADDING_TOP } from '@/constants/layout';
import { WyreColors } from '@/constants/theme';

type TabScreenLayoutProps = {
  title: string;
  children?: ReactNode;
};

export function TabScreenLayout({ title, children }: TabScreenLayoutProps) {
  const insets = useSafeAreaInsets();

  // The Android tab bar already reserves the safe area below the screen, so
  // adding the inset again leaves a large empty band above the tabs.
  const bottomPadding = Platform.OS === 'ios' ? insets.bottom + 24 : 24;

  return (
    <View style={styles.root}>
      <AppHeader rightAction={<UserAvatarButton />} />

      <View style={[styles.content, { paddingBottom: bottomPadding }]}>
        <Text style={styles.title}>{title}</Text>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: WyreColors.pageBg,
  },
  content: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING_H,
    paddingTop: SCREEN_PADDING_TOP,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: WyreColors.textPrimary,
    marginBottom: 16,
  },
});
