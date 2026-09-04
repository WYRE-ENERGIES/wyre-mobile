import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WyreColors } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';
import { fetchDieselDailyUsage } from '@/lib/cost-tracker-api';
import { entriesInMonth, parseMonthForDrillDown } from '@/lib/cost-tracker-transform';
import type { DieselDailyEntry } from '@/lib/cost-tracker-types';
import { formatDecimalHours, formatLitres, formatShortDate } from '@/lib/format';

type DieselDetailModalProps = {
  visible: boolean;
  month: string | null;
  userId: string | null;
  isOperator?: boolean;
  onClose: () => void;
};

function EntryCard({
  entry,
  isOperator,
}: {
  entry: DieselDailyEntry;
  isOperator?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.entryCard, { backgroundColor: colors.surface }]}>
      <View style={styles.entryHeader}>
        <Text style={[styles.entryDate, { color: colors.textOnCard }]}>
          {formatShortDate(entry.date)}
        </Text>
        {isOperator ? (
          <View style={styles.editBtn}>
            <MaterialIcons name="edit" size={16} color={WyreColors.purple} />
            <Text style={styles.editText}>Edit on web</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.entryMetrics}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textOnCardSecondary }]}>Quantity</Text>
          <Text style={[styles.metricValue, { color: colors.textOnCard }]}>
            {formatLitres(entry.quantity)}
          </Text>
        </View>
        <View style={styles.metricDivider} />
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textOnCardSecondary }]}>Hours</Text>
          <Text style={[styles.metricValue, { color: colors.textOnCard }]}>
            {formatDecimalHours(entry.hours_of_use)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export function DieselDetailModal({
  visible,
  month,
  userId,
  isOperator = false,
  onClose,
}: DieselDetailModalProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [rows, setRows] = useState<DieselDailyEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !month || !userId) return;

    const parsed = parseMonthForDrillDown(month);
    if (!parsed) {
      setError('Unable to open this month.');
      setRows([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void fetchDieselDailyUsage(userId, parsed.year, parsed.month)
      .then((data) => {
        if (!cancelled) {
          const filtered = entriesInMonth(data, month);
          setRows(
            [...filtered].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            ),
          );
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('Unable to load daily diesel entries.');
          setRows([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [visible, month, userId]);

  const summary = useMemo(() => {
    const totalLitres = rows.reduce((sum, row) => sum + (row.quantity ?? 0), 0);
    const totalHours = rows.reduce((sum, row) => sum + (row.hours_of_use ?? 0), 0);
    return { totalLitres, totalHours };
  }, [rows]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top, backgroundColor: colors.pageBg }]}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.textOnCard }]}>Daily diesel entries</Text>
            {month ? <Text style={[styles.subtitle, { color: colors.accent }]}>{month}</Text> : null}
          </View>
          <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
            <MaterialIcons name="close" size={22} color={colors.textOnCard} />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : error ? (
          <View style={styles.centered}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : (
          <>
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.summaryLabel, { color: colors.textOnCardSecondary }]}>
                  Total quantity
                </Text>
                <Text style={[styles.summaryValue, { color: colors.textOnCard }]}>
                  {formatLitres(summary.totalLitres)}
                </Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
                <Text style={[styles.summaryLabel, { color: colors.textOnCardSecondary }]}>
                  Total hours
                </Text>
                <Text style={[styles.summaryValue, { color: colors.textOnCard }]}>
                  {formatDecimalHours(summary.totalHours)}
                </Text>
              </View>
            </View>

            <FlatList
              data={rows}
              keyExtractor={(item) => String(item.fuel_consumption_id ?? item.date)}
              contentContainerStyle={[
                styles.listContent,
                { paddingBottom: insets.bottom + 24 },
              ]}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <Text style={[styles.empty, { color: colors.textOnPageMuted }]}>
                  No daily entries for this month.
                </Text>
              }
              ListFooterComponent={
                rows.length > 0 ? (
                  <Text style={[styles.footer, { color: colors.textOnPageMuted }]}>
                    {rows.length} entries
                  </Text>
                ) : null
              }
              renderItem={({ item }) => (
                <EntryCard entry={item} isOperator={isOperator} />
              )}
            />
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WyreColors.pageBg,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  summaryLabel: {
    fontSize: 12,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 10,
  },
  entryCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
    marginBottom: 10,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  entryDate: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(92, 18, 167, 0.08)',
  },
  editText: {
    fontSize: 12,
    fontWeight: '600',
    color: WyreColors.purple,
  },
  pressed: {
    opacity: 0.7,
  },
  entryMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metric: {
    flex: 1,
    gap: 4,
  },
  metricDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: WyreColors.border,
    marginHorizontal: 12,
  },
  metricLabel: {
    fontSize: 12,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  error: {
    fontSize: 14,
    color: WyreColors.error,
    textAlign: 'center',
  },
  empty: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 32,
  },
  footer: {
    fontSize: 12,
    textAlign: 'center',
    paddingTop: 4,
  },
});
