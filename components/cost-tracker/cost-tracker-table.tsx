import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/context/theme-context';

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
  const { colors } = useAppTheme();
  const tableWidth = columns.reduce((sum, column) => sum + column.width, 0);

  if (!rows.length) {
    return <Text style={[styles.empty, { color: colors.textOnCardSecondary }]}>{emptyMessage}</Text>;
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ width: tableWidth }}>
          <View style={[styles.headerRow, { backgroundColor: colors.surfaceMuted }]}>
            {columns.map((column) => (
              <Text
                key={column.key}
                style={[
                  styles.headerCell,
                  { color: colors.textOnCardSecondary },
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
              style={[
                styles.bodyRow,
                { borderBottomColor: colors.border },
                index % 2 === 1 ? { backgroundColor: colors.surfaceMuted } : null,
              ]}>
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
                      { color: colors.textOnCard },
                      { width: column.width },
                      column.align === 'right' ? styles.alignRight : null,
                      isPressable ? { color: colors.accent, fontWeight: '600' } : null,
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

      {footer ? (
        <Text style={[styles.footer, { color: colors.textOnCardSecondary }]}>{footer}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  headerCell: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  bodyRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bodyCell: {
    fontSize: 12,
    paddingHorizontal: 4,
  },
  alignRight: {
    textAlign: 'right',
  },
  empty: {
    fontSize: 13,
    paddingVertical: 8,
  },
  footer: {
    fontSize: 12,
  },
});
