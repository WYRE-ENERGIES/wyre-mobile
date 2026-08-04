import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { WyreColors } from '@/constants/theme';

type SectionCardProps = {
  title: string;
  children: ReactNode;
  subtitle?: string;
};

export function SectionCard({ title, subtitle, children }: SectionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: WyreColors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WyreColors.border,
    gap: 14,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: WyreColors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: WyreColors.textSecondary,
  },
});
