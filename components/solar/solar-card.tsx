import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { WyreColors } from '@/constants/theme';

type SolarCardProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function SolarCard({ children, style }: SolarCardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: WyreColors.surface,
    borderRadius: 12,
    padding: 16,
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 3,
  },
});
