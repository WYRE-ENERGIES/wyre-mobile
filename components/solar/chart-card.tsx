import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { WyreColors } from '@/constants/theme';

type ChartCardProps = {
  title: string;
  headerRight?: ReactNode;
  children: ReactNode;
};

export function ChartCard({ title, headerRight, children }: ChartCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {headerRight ? <View style={styles.headerRight}>{headerRight}</View> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: WyreColors.surface,
    borderRadius: 12,
    padding: 14,
    gap: 10,
    overflow: 'hidden',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    minHeight: 36,
  },
  title: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '600',
    color: WyreColors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
});
