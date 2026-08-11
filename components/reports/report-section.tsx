import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { WyreColors } from '@/constants/theme';

type SectionCardProps = {
  title: string;
  info?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  children: ReactNode;
  right?: ReactNode;
};

export function ReportSectionCard({
  title,
  info,
  icon = 'bolt',
  children,
  right,
}: SectionCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.icon}>
            <MaterialIcons name={icon} size={18} color="#FFFFFF" />
          </View>
          <View style={styles.titleWrap}>
            <Text style={styles.title}>{title}</Text>
            {right}
          </View>
        </View>
        {info ? (
          <View style={styles.infoRow}>
            <MaterialIcons name="info-outline" size={16} color="#6B7280" />
            <Text style={styles.info}>{info}</Text>
          </View>
        ) : null}
      </View>
      {children}
    </View>
  );
}

type KvProps = { label: string; value: string };

export function ReportKvGrid({ items }: { items: KvProps[] }) {
  return (
    <View style={styles.kvGrid}>
      {items.map((item) => (
        <View key={`${item.label}-${item.value}`} style={styles.kvItem}>
          <Text style={styles.kvLabel}>{item.label}</Text>
          <Text style={styles.kvValue}>{item.value}</Text>
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
  if (rows.length === 0) {
    return <Text style={styles.empty}>No data for this section.</Text>;
  }

  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        {headers.map((header) => (
          <Text key={header} style={[styles.tableCell, styles.tableHeaderCell]}>
            {header}
          </Text>
        ))}
      </View>
      {rows.map((row, index) => (
        <View
          key={`row-${index}`}
          style={[styles.tableRow, index === rows.length - 1 && styles.tableRowLast]}>
          {row.map((cell, cellIndex) => (
            <Text key={`${index}-${cellIndex}`} style={styles.tableCell}>
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
    backgroundColor: '#FFFFFF',
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
    color: '#1F2937',
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
    color: '#515151',
  },
  kvGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kvItem: {
    width: '47%',
    backgroundColor: '#F7F8FB',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    gap: 4,
  },
  kvLabel: {
    fontSize: 11,
    color: WyreColors.textSecondary,
    fontWeight: '500',
  },
  kvValue: {
    fontSize: 14,
    fontWeight: '700',
    color: WyreColors.textPrimary,
  },
  table: {
    borderWidth: 1,
    borderColor: '#E8EAF0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F8',
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E8EAF0',
  },
  tableRowLast: {},
  tableCell: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 10,
    fontSize: 11,
    color: WyreColors.textPrimary,
  },
  tableHeaderCell: {
    fontWeight: '700',
    color: WyreColors.textSecondary,
  },
  empty: {
    fontSize: 13,
    color: WyreColors.textSecondary,
  },
});
