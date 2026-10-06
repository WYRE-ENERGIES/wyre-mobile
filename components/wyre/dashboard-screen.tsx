import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import type { ColorValue } from 'react-native';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/context/theme-context';

type DashboardScreenProps = {
  children: ReactNode;
  darkGradientColors?: readonly [ColorValue, ColorValue, ...ColorValue[]];
  darkGradientLocations?: readonly [number, number, ...number[]];
};

export function DashboardScreen({
  children,
  darkGradientColors,
  darkGradientLocations,
}: DashboardScreenProps) {
  const { colors, isDark } = useAppTheme();

  if (!isDark) {
    return <View style={[styles.root, { backgroundColor: colors.pageBg }]}>{children}</View>;
  }

  return (
    <LinearGradient
      colors={darkGradientColors ?? [colors.gradientFrom, colors.gradientTo]}
      locations={darkGradientLocations}
      style={styles.root}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
