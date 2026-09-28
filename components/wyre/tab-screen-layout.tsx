import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/wyre/app-header';
import { UserAvatarButton } from '@/components/wyre/user-avatar-button';
import { useAppTheme } from '@/context/theme-context';

type TabScreenLayoutProps = {
  title: string;
  children?: ReactNode;
};

export function TabScreenLayout({ title, children }: TabScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  return (
    <View style={[styles.root, { backgroundColor: colors.pageBg }]}>
      <AppHeader rightAction={<UserAvatarButton />} />

      <View style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={[styles.title, { color: colors.textOnPage }]}>{title}</Text>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
});
