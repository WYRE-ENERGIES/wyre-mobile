import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/context/theme-context';

type ScreenCardProps = {
  children: ReactNode;
  title?: string;
};

export function ScreenCard({ children, title }: ScreenCardProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface },
      ]}>
      {title ? (
        <Text style={[styles.cardTitle, { color: colors.textOnCard }]}>{title}</Text>
      ) : null}
      {children}
    </View>
  );
}

type DetailFieldProps = {
  label: string;
  value: string;
};

export function DetailField({ label, value }: DetailFieldProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, { color: colors.textOnCardSecondary }]}>{label}</Text>
      <Text style={[styles.fieldValue, { color: colors.textOnCard }]}>{value}</Text>
    </View>
  );
}

type DetailSectionProps = {
  title: string;
  children: ReactNode;
};

export function DetailSection({ title, children }: DetailSectionProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.section, { borderTopColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.textOnCard }]}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
  },
  field: {
    gap: 4,
    minWidth: '45%',
    flexGrow: 1,
    flexBasis: '45%',
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  section: {
    paddingTop: 18,
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
  },
  sectionBody: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
  },
});
