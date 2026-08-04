import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';

import { ChartCard } from '@/components/solar/chart-card';
import { ChartInsightRow } from '@/components/solar/chart-insight-row';
import { DatePickerButton } from '@/components/solar/date-picker-button';
import { SolarAreaChart } from '@/components/solar/solar-area-chart';
import { WyreColors } from '@/constants/theme';
import type { SolarHourlyChart } from '@/lib/solar-types';

type PvProductionChartSectionProps = {
  data: SolarHourlyChart | null;
  loading: boolean;
  error: string | null;
  date: Date;
  onDateChange: (date: Date) => void;
};

export function PvProductionChartSection({
  data,
  loading,
  error,
  date,
  onDateChange,
}: PvProductionChartSectionProps) {
  const labels = useMemo(() => data?.hours?.map((h) => h.hour_label) ?? [], [data]);
  const insights = useMemo(() => {
    const hours = data?.hours ?? [];
    if (!hours.length) return [];

    const production = hours.map((hour) => Math.max(hour.pv_kw ?? 0, 0));
    const total = production.reduce((sum, value) => sum + value, 0);
    const peak = Math.max(...production);
    const peakIndex = production.indexOf(peak);
    const activeHours = production.filter((value) => value > 0).length;

    return [
      { label: 'Energy produced', value: `${total.toFixed(1)} kWh`, accent: '#FCCC43' },
      {
        label: 'Peak output',
        value: `${peak.toFixed(1)} kW · ${hours[peakIndex]?.hour_label ?? '—'}`,
        accent: '#0078FF',
      },
      { label: 'Generating', value: `${activeHours} hrs`, accent: WyreColors.success },
    ];
  }, [data]);
  const series = useMemo(
    () => [
      {
        key: 'pv_kw',
        label: 'Production (kW)',
        color: '#0078FF',
        values: (data?.hours ?? []).map((h) => h.pv_kw ?? 0),
      },
    ],
    [data],
  );

  return (
    <ChartCard
      title="PV Production"
      headerRight={
        <DatePickerButton value={date} maximumDate={new Date()} onChange={onDateChange} />
      }>
      {!loading && !error ? <ChartInsightRow insights={insights} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <SolarAreaChart labels={labels} series={series} loading={loading} filled />
    </ChartCard>
  );
}

const styles = StyleSheet.create({
  error: {
    fontSize: 13,
    color: WyreColors.error,
    marginBottom: 8,
  },
});
