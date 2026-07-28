import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { WyreColors } from '@/constants/theme';

type ScreenCardProps = {
  children: ReactNode;
  title?: string;
};

export function ScreenCard({ children, title }: ScreenCardProps) {
  return (
    <View style={styles.card}>
      {title ? <Text style={styles.cardTitle}>{title}</Text> : null}
      {children}
    </View>
  );
}

type DetailFieldProps = {
  label: string;
  value: string;
};

export function DetailField({ label, value }: DetailFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

type DetailSectionProps = {
  title: string;
  children: ReactNode;
};

export function DetailSection({ title, children }: DetailSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 22,
    borderWidth: 1,
    borderColor: WyreColors.border,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: WyreColors.textPrimary,
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
    color: WyreColors.textSecondary,
    letterSpacing: 0.2,
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: '700',
    color: WyreColors.textPrimary,
  },
  section: {
    paddingTop: 18,
    marginTop: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: WyreColors.border,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: WyreColors.textPrimary,
    marginBottom: 14,
  },
  sectionBody: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
  },
});
