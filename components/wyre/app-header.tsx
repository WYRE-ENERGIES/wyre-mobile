import { Image } from 'expo-image';
import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AUTH_LOGO } from '@/constants/auth-logo';
import { WyreColors } from '@/constants/theme';

type AppHeaderProps = {
  rightAction?: ReactNode;
};

export function AppHeader({ rightAction }: AppHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <Image source={AUTH_LOGO.source} style={styles.logo} contentFit="contain" />
      {rightAction ? <View style={styles.rightAction}>{rightAction}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: WyreColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 96,
    height: 38,
  },
  rightAction: {
    marginLeft: 12,
  },
});
