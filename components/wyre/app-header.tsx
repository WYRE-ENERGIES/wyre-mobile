import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WyreWordmark } from '@/components/auth/wyre-wordmark';
import { useAppTheme } from '@/context/theme-context';

type AppHeaderProps = {
  leftContent?: ReactNode;
  rightAction?: ReactNode;
  showWordmark?: boolean;
};

export function AppHeader({
  leftContent,
  rightAction,
  showWordmark = true,
}: AppHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.header,
        {
          paddingTop: insets.top + 12,
          backgroundColor: colors.headerBg,
          borderBottomColor: isDark ? 'transparent' : colors.border,
        },
      ]}>
      {leftContent ?? (showWordmark ? <WyreWordmark width={96} height={38} /> : <View />)}
      {rightAction ? <View style={styles.rightAction}>{rightAction}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightAction: {
    marginLeft: 12,
  },
});
