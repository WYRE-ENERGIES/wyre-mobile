import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/context/theme-context';

type SectionCardProps = {
  title: string;
  children: ReactNode;
  subtitle?: string;
};

export function SectionCard({ title, subtitle, children }: SectionCardProps) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textOnCard }]}>{title}</Text>
        {subtitle ? (
          <Text style={[styles.subtitle, { color: colors.textOnCardSecondary }]}>{subtitle}</Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
  },
});
