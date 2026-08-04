import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { WyreColors } from '@/constants/theme';

export type TableColumn<T> = {
  key: string;
  title: string;
  width: number;
  align?: 'left' | 'right';
  render?: (row: T) => string;
};

type CostTrackerTableProps<T extends Record<string, unknown>> = {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  emptyMessage?: string;
  footer?: string;
  onRowPress?: (row: T) => void;
  pressableColumnKey?: string;
};

export function CostTrackerTable<T extends Record<string, unknown>>({
  columns,
  rows,
  rowKey,
  emptyMessage = 'No data available.',
  footer,
  onRowPress,
  pressableColumnKey,
}: CostTrackerTableProps<T>) {
  const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);

  if (!rows.length) {
    return <Text style={styles.empty}>{emptyMessage}</Text>;
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width: tableWidth }}>
          <View style={styles.headerRow}>
            {columns.map((column) => (
              <Text
                key={column.key}
                style={[
                  styles.headerCell,
                  { width: column.width },
                  column.align === 'right' ? styles.alignRight : null,
                ]}>
                {column.title}
              </Text>
            ))}
          </View>

          {rows.map((row, index) => (
            <View
              key={rowKey(row, index)}
              style={[styles.bodyRow, index % 2 === 1 ? styles.bodyRowAlt : null]}>
              {columns.map((column) => {
                const raw = row[column.key];
                const value =
                  column.render?.(row) ??
                  (raw == null || raw === '' ? '—' : String(raw));
                const isPressable = pressableColumnKey === column.key && onRowPress;

                const cell = (
                  <Text
                    style={[
                      styles.bodyCell,
                      { width: column.width },
                      column.align === 'right' ? styles.alignRight : null,
                      isPressable ? styles.pressableCell : null,
                    ]}
                    numberOfLines={2}>
                    {value}
                  </Text>
                );

                return isPressable ? (
                  <Pressable
                    key={column.key}
                    style={{ width: column.width }}
                    onPress={() => onRowPress(row)}>
                    {cell}
                  </Pressable>
                ) : (
                  <View key={column.key}>{cell}</View>
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: WyreColors.pageBg,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '700',
    color: WyreColors.textSecondary,
    paddingHorizontal: 4,
  },
  bodyRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: WyreColors.border,
  },
  bodyRowAlt: {
    backgroundColor: 'rgba(242, 242, 248, 0.55)',
  },
  bodyCell: {
    fontSize: 12,
    color: WyreColors.textPrimary,
    paddingHorizontal: 4,
  },
  pressableCell: {
    color: WyreColors.purple,
    fontWeight: '600',
  },
  alignRight: {
    textAlign: 'right',
  },
  empty: {
    fontSize: 13,
    color: WyreColors.textSecondary,
    paddingVertical: 8,
  },
  footer: {
    fontSize: 12,
    color: WyreColors.textSecondary,
  },
});
