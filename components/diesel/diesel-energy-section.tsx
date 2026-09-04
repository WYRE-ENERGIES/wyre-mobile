import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';

import { DonutChart } from '@/components/reports/donut-chart';
import { useAppTheme } from '@/context/theme-context';
import { WyreColors } from '@/constants/theme';
import { formatKwh, formatNumber } from '@/lib/format';
import type { DieselEnergyGenerator } from '@/lib/diesel-types';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type DieselEnergySectionProps = {
  totalEnergy: number;
  generators: DieselEnergyGenerator[];
  month: number;
  year: number;
  onChangeMonth: (month: number) => void;
  onChangeYear: (year: number) => void;
};

export function DieselEnergySection({
  totalEnergy,
  generators,
  month,
  year,
  onChangeMonth,
  onChangeYear,
}: DieselEnergySectionProps) {
  const { colors } = useAppTheme();
  const [open, setOpen] = useState<'month' | 'year' | null>(null);
  const yearOptions = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
  const slices = (generators.length ? generators : [{ name: 'Generator', energy: totalEnergy }]).map(
    (item, index) => ({
      label: item.name,
      value: item.energy ?? 0,
      color: index % 2 === 0 ? colors.chartYellow : WyreColors.purple,
    }),
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textOnPage }]}>Total Energy Used</Text>
        <View style={styles.pills}>
          <Pressable
            onPress={() => setOpen('month')}
            style={[styles.pill, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pillText, { color: colors.textOnCard }]}>
              {MONTHS[month - 1]?.slice(0, 3)}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setOpen('year')}
            style={[styles.pill, { backgroundColor: colors.surface }]}>
            <Text style={[styles.pillText, { color: colors.textOnCard }]}>{year}</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <DonutChart
          slices={slices}
          size={150}
          strokeWidth={28}
          centerTitle="Total"
          centerValue={`${formatNumber(totalEnergy, 0)} kWh`}
        />
        <View style={styles.legend}>
          {slices.map((slice) => (
            <View key={slice.label} style={styles.legendRow}>
              <View style={[styles.dot, { backgroundColor: slice.color }]} />
              <Text style={[styles.legendText, { color: colors.textOnCard }]}>
                {slice.label} · {formatKwh(slice.value, 0)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Modal transparent visible={open != null} animationType="fade" onRequestClose={() => setOpen(null)}>
        <Pressable
          style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}
          onPress={() => setOpen(null)}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            {(open === 'month' ? MONTHS.map((label, index) => ({ label, value: index + 1 })) : yearOptions.map((option) => ({ label: String(option), value: option }))).map(
              (option) => (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    if (open === 'month') onChangeMonth(option.value);
                    else onChangeYear(option.value);
                    setOpen(null);
                  }}
                  style={styles.modalRow}>
                  <Text style={[styles.modalLabel, { color: colors.textOnCard }]}>{option.label}</Text>
                </Pressable>
              ),
            )}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
  },
  pills: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    borderRadius: 999,
    minWidth: 72,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  legend: {
    flex: 1,
    gap: 10,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  modalCard: {
    borderRadius: 20,
    paddingVertical: 8,
    maxHeight: '70%',
  },
  modalRow: {
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
