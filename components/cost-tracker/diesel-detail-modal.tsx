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
import { dieselTrackerOverviewError, fetchDieselDailyUsage } from '@/lib/cost-tracker-api';
import { entriesInMonth, parseMonthForDrillDown } from '@/lib/cost-tracker-transform';
import type { DieselDailyEntry } from '@/lib/cost-tracker-types';
import { formatDecimalHours, formatKwh, formatLitres, formatNumber, formatShortDate } from '@/lib/format';

type DieselDetailModalProps = {
  visible: boolean;
  month: string | null;
  branchId: number | null;
  onClose: () => void;
};

function durationInMinutes(value: string): number {
  const match = value.match(/(\d+)\s*Hrs?\s*:\s*(\d+)\s*Mins?/i);
  if (!match) return 0;
  return Number(match[1]) * 60 + Number(match[2]);
}

function generatorNames(entry: DieselDailyEntry): string[] {
  return [
    ...new Set([
      ...Object.keys(entry.energy_consumed ?? {}),
      ...Object.keys(entry.energy_per_litre ?? {}),
      ...Object.keys(entry.litres_per_hour ?? {}),
    ]),
  ].sort();
}

function hasLoggedDiesel(entry: DieselDailyEntry): boolean {
  return (
    (entry.quantity ?? 0) > 0 ||
    (entry.fuel_consumption_id ?? 0) > 0 ||
    durationInMinutes(entry.hours_of_use) > 0
  );
}

function EntryCard({ entry }: { entry: DieselDailyEntry }) {
  const { colors } = useAppTheme();
  const generators = generatorNames(entry).filter((name) => {
    const energy = entry.energy_consumed?.[name] ?? 0;
    const perLitre = entry.energy_per_litre?.[name] ?? 0;
    const litresPerHour = entry.litres_per_hour?.[name] ?? 0;
    return energy > 0 || perLitre > 0 || litresPerHour > 0;
  });

  return (
    <View style={[styles.entryCard, { backgroundColor: colors.surface }]}>
      <View style={styles.entryHeader}>
        <Text style={[styles.entryDate, { color: colors.textOnCard }]}>
          {formatShortDate(entry.date)}
        </Text>
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
            {entry.hours_of_use}
          </Text>
        </View>
      </View>

      {generators.map((name) => (
        <View key={name} style={[styles.generatorRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.generatorName, { color: colors.textOnCard }]}>{name}</Text>
          <Text style={[styles.generatorMetric, { color: colors.textOnCardSecondary }]}>
            {formatKwh(entry.energy_consumed?.[name], 1)}
            {'  ·  '}
            {formatNumber(entry.energy_per_litre?.[name], 2)} kWh/L
            {'  ·  '}
            {formatNumber(entry.litres_per_hour?.[name], 2)} L/h
          </Text>
        </View>
      ))}
    </View>
  );
}

export function DieselDetailModal({
  visible,
  month,
  branchId,
  onClose,
}: DieselDetailModalProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [rows, setRows] = useState<DieselDailyEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !month || !branchId) return;

    const parsed = parseMonthForDrillDown(month);
    if (!parsed) {
      setError('Unable to open this month.');
      setRows([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    void fetchDieselDailyUsage(branchId, parsed.year, parsed.month)
      .then((data) => {
        if (!cancelled) {
          const filtered = entriesInMonth(data, month).filter(hasLoggedDiesel);
          setRows(
            [...filtered].sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
            ),
          );
        }
      })
      .catch((caught) => {
        if (!cancelled) {
          setError(dieselTrackerOverviewError(caught));
          setRows([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [visible, month, branchId]);

  const summary = useMemo(() => {
    const totalLitres = rows.reduce((sum, row) => sum + (row.quantity ?? 0), 0);
    const totalMinutes = rows.reduce(
      (sum, row) => sum + durationInMinutes(row.hours_of_use),
      0,
    );
    const totalHours = totalMinutes / 60;
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
              keyExtractor={(item) => item.date}
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
              renderItem={({ item }) => <EntryCard entry={item} />}
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
  generatorRow: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    gap: 3,
  },
  generatorName: {
    fontSize: 12,
    fontWeight: '700',
  },
  generatorMetric: {
    fontSize: 11,
    lineHeight: 16,
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
