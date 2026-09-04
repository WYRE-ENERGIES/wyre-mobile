import { Pressable, StyleSheet, Text, View } from 'react-native';

import { DonutChart } from '@/components/reports/donut-chart';
import { useAppTheme } from '@/context/theme-context';
import { WyreColors } from '@/constants/theme';
import { formatNumber } from '@/lib/format';
import type { DieselRuntimeGenerator } from '@/lib/diesel-types';

type DieselStatusSectionProps = {
  generators: DieselRuntimeGenerator[];
  totalRuntime?: string | number;
  totalFuelLiters?: number;
  onSeeMore: () => void;
};

export function DieselStatusSection({
  generators,
  totalRuntime,
  totalFuelLiters,
  onSeeMore,
}: DieselStatusSectionProps) {
  const { colors } = useAppTheme();
  const hoursSlices = generators.map((item, index) => ({
    label: item.name,
    value: item.runtime_hours ?? 0,
    color: index % 2 === 0 ? colors.chartYellow : WyreColors.purple,
  }));
  const fuelSlices = generators.map((item, index) => ({
    label: item.name,
    value: item.fuel_liters ?? 0,
    color: index % 2 === 0 ? colors.chartYellow : WyreColors.purple,
  }));

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textOnPage }]}>Generator Status</Text>
        <Pressable onPress={onSeeMore} hitSlop={8}>
          <Text style={[styles.link, { color: colors.accent }]}>See More</Text>
        </Pressable>
      </View>
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.donutCol}>
          <DonutChart
            slices={hoursSlices.length ? hoursSlices : [{ label: 'Run', value: 1, color: colors.chartYellow }]}
            size={120}
            strokeWidth={22}
            centerTitle="Run"
            centerValue="Hours"
          />
          <Text style={[styles.total, { color: colors.textOnCardSecondary }]}>
            {String(totalRuntime ?? '—')}
          </Text>
        </View>
        <View style={styles.donutCol}>
          <DonutChart
            slices={fuelSlices.length ? fuelSlices : [{ label: 'Fuel', value: 1, color: colors.chartYellow }]}
            size={120}
            strokeWidth={22}
            centerTitle="Fuel"
            centerValue="Litres"
          />
          <Text style={[styles.total, { color: colors.textOnCardSecondary }]}>
            {formatNumber(totalFuelLiters, 0)} L
          </Text>
        </View>
      </View>
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
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  donutCol: {
    alignItems: 'center',
    gap: 8,
  },
  total: {
    fontSize: 13,
    fontWeight: '600',
  },
});
