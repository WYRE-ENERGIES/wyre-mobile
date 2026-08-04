import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChartCard } from '@/components/solar/chart-card';
import { ChartInsightRow } from '@/components/solar/chart-insight-row';
import { DatePickerButton } from '@/components/solar/date-picker-button';
import { SolarAreaChart } from '@/components/solar/solar-area-chart';
import { WyreColors } from '@/constants/theme';
import type { ConsumptionParameter, SolarHourlyChart } from '@/lib/solar-types';
import { CONSUMPTION_PARAMETERS } from '@/lib/solar-types';

type ConsumptionChartSectionProps = {
  data: SolarHourlyChart | null;
  loading: boolean;
  error: string | null;
  date: Date;
  onDateChange: (date: Date) => void;
};

export function ConsumptionChartSection({
  data,
  loading,
  error,
  date,
  onDateChange,
}: ConsumptionChartSectionProps) {
  const [parameter, setParameter] = useState<ConsumptionParameter>('all');

  const labels = useMemo(() => data?.hours?.map((h) => h.hour_label) ?? [], [data]);
  const insights = useMemo(() => {
    const hours = data?.hours ?? [];
    if (!hours.length) return [];

    const loads = hours.map((hour) => Math.max(hour.load_kw ?? 0, 0));
    const totalLoad = loads.reduce((total, value) => total + value, 0);
    const peakLoad = Math.max(...loads);
    const peakIndex = loads.indexOf(peakLoad);
    const solarUsed = hours.reduce((total, hour, index) => {
      const production = Math.max(hour.pv_kw ?? 0, 0);
      return total + Math.min(production, loads[index] ?? 0);
    }, 0);
    const solarCoverage = totalLoad > 0 ? Math.min((solarUsed / totalLoad) * 100, 100) : 0;

    return [
      { label: 'Daily load', value: `${totalLoad.toFixed(1)} kWh`, accent: '#8B5CF6' },
      {
        label: 'Peak demand',
        value: `${peakLoad.toFixed(1)} kW · ${hours[peakIndex]?.hour_label ?? '—'}`,
        accent: '#D7C6F3',
      },
      {
        label: 'Solar coverage',
        value: `${Math.round(solarCoverage)}%`,
        accent: '#FCCC43',
      },
    ];
  }, [data]);

  const series = useMemo(() => {
    const hours = data?.hours ?? [];
    const allSeries = [
      {
        key: 'load',
        label: 'Load demand (kW)',
        color: '#8B5CF6',
        values: hours.map((h) => h.load_kw ?? 0),
      },
      {
        key: 'production',
        label: 'Solar production (kW)',
        color: '#FCCC43',
        values: hours.map((h) => h.pv_kw ?? 0),
      },
      {
        key: 'grid',
        label: 'Grid (kW)',
        color: '#0078FF',
        values: hours.map((h) => h.grid_kw ?? 0),
      },
    ];

    if (parameter === 'all') return allSeries;
    if (parameter === 'pv') return allSeries.filter((item) => item.key === 'production');
    return allSeries.filter((item) => item.key === parameter);
  }, [data, parameter]);

  return (
    <ChartCard
      title="Consumption"
      headerRight={
        <DatePickerButton value={date} maximumDate={new Date()} onChange={onDateChange} />
      }>
      {!loading && !error ? <ChartInsightRow insights={insights} /> : null}

      <View style={styles.filterRow}>
        {CONSUMPTION_PARAMETERS.map((item) => {
          const selected = parameter === item.key;
          return (
            <Pressable
              key={item.key}
              style={[styles.filterChip, selected && styles.filterChipSelected]}
              onPress={() => setParameter(item.key)}>
              <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      <SolarAreaChart
        labels={labels}
        series={series}
        loading={loading}
        filled={parameter !== 'all'}
      />
    </ChartCard>
  );
}

const styles = StyleSheet.create({
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: WyreColors.border,
    backgroundColor: WyreColors.pageBg,
  },
  filterChipSelected: {
    borderColor: WyreColors.purple,
    backgroundColor: '#f3e8ff',
  },
  filterChipText: {
    fontSize: 12,
    color: WyreColors.textSecondary,
  },
  filterChipTextSelected: {
    color: WyreColors.purple,
    fontWeight: '600',
  },
  error: {
    fontSize: 13,
    color: WyreColors.error,
  },
});
