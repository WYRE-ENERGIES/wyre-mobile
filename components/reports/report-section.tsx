import type { SymbolViewProps } from 'expo-symbols';
import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/context/theme-context';

type SectionCardProps = {
  title: string;
  info?: string;
  icon?: SymbolViewProps['name'];
  children: ReactNode;
  right?: ReactNode;
};

export function ReportSectionCard({
  title,
  info,
  icon = 'bolt.fill',
  children,
  right,
}: SectionCardProps) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.icon}>
            <IconSymbol name={icon} size={18} color="#FFFFFF" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={[styles.title, { color: colors.textOnCard }]}>{title}</Text>
            {right}
          </View>
        </View>
        {info ? (
          <View style={styles.infoRow}>
            <IconSymbol name="info.circle" size={16} color="#6B7280" />
            <Text style={[styles.info, { color: colors.textOnCardSecondary }]}>{info}</Text>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

type KvProps = { label: string; value: string };

export function ReportKvGrid({ items }: { items: KvProps[] }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.kvGrid}>
      {items.map((item) => (
        <View
          key={`${item.label}-${item.value}`}
          style={[styles.kvItem, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={[styles.kvLabel, { color: colors.textOnCardSecondary }]}>{item.label}</Text>
          <Text style={[styles.kvValue, { color: colors.textOnCard }]}>{item.value}</Text>
        </View>
      ))}
    </View>
  );
}

export function ReportTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: string[][];
}) {
  const { colors } = useAppTheme();
  if (rows.length === 0) {
    return (
      <Text style={[styles.empty, { color: colors.textOnCardSecondary }]}>
        No data for this section.
      </Text>
    );
  }

  return (
    <View style={[styles.table, { borderColor: colors.border }]}>
      <View style={[styles.tableHeader, { backgroundColor: colors.surfaceMuted }]}>
        {headers.map((header) => (
          <Text
            key={header}
            style={[
              styles.tableCell,
              styles.tableHeaderCell,
              { color: colors.textOnCardSecondary },
            ]}>
            {header}
          </Text>
        ))}
      </View>
      {rows.map((row, index) => (
        <View
          key={`row-${index}`}
          style={[
            styles.tableRow,
            { borderTopColor: colors.border },
            index === rows.length - 1 && styles.tableRowLast,
          ]}>
          {row.map((cell, cellIndex) => (
            <Text
              key={`${index}-${cellIndex}`}
              style={[styles.tableCell, { color: colors.textOnCard }]}>
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    padding: 16,
    gap: 14,
  },
  header: {
    gap: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleWrap: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  info: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  kvGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kvItem: {
    width: '47%',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 4,
  },
  kvLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  kvValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  table: {
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tableRowLast: {},
  tableCell: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 11,
  },
  tableHeaderCell: {
    fontWeight: '700',
  },
  empty: {
    fontSize: 13,
  },
});
