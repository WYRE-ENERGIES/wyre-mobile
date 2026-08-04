import { useMemo } from 'react';
import { StyleSheet, Text } from 'react-native';

import { ChartCard } from '@/components/solar/chart-card';
import { ChartInsightRow } from '@/components/solar/chart-insight-row';
import { DatePickerButton } from '@/components/solar/date-picker-button';
import { SolarAreaChart } from '@/components/solar/solar-area-chart';
import { WyreColors } from '@/constants/theme';
import type { SolarHourlyChart } from '@/lib/solar-types';

type BatteryChartSectionProps = {
  data: SolarHourlyChart | null;
  loading: boolean;
  error: string | null;
  date: Date;
  onDateChange: (date: Date) => void;
};

export function BatteryChartSection({
  data,
  loading,
  error,
  date,
  onDateChange,
}: BatteryChartSectionProps) {
  const labels = useMemo(() => data?.hours?.map((h) => h.hour_label) ?? [], [data]);
  const insights = useMemo(() => {
    const hours = data?.hours ?? [];
    if (!hours.length) return [];

    const totalCharge = hours.reduce(
      (sum, hour) => sum + Math.max(hour.battery_charge_kwh ?? 0, 0),
      0,
    );
    const totalDischarge = hours.reduce(
      (sum, hour) => sum + Math.max(hour.battery_discharge_kwh ?? 0, 0),
      0,
    );
    const net = totalCharge - totalDischarge;

    return [
      { label: 'Charged', value: `${totalCharge.toFixed(1)} kWh`, accent: '#8B5CF6' },
      { label: 'Discharged', value: `${totalDischarge.toFixed(1)} kWh`, accent: '#58B90A' },
      {
        label: net >= 0 ? 'Net stored' : 'Net supplied',
        value: `${Math.abs(net).toFixed(1)} kWh`,
        accent: '#FCCC43',
      },
    ];
  }, [data]);
  const series = useMemo(
    () => [
      {
        key: 'backup_load',
        label: 'Backup load',
        color: '#FCCC43',
        values: (data?.hours ?? []).map((h) => h.backup_load_kwh ?? 0),
      },
      {
        key: 'battery_charge',
        label: 'Battery charge',
        color: '#D7C6F3',
        values: (data?.hours ?? []).map((h) => h.battery_charge_kwh ?? 0),
      },
      {
        key: 'battery_discharge',
        label: 'Battery discharge',
        color: '#58B90A',
        values: (data?.hours ?? []).map((h) => h.battery_discharge_kwh ?? 0),
      },
    ],
    [data],
  );

  return (
    <ChartCard
      title="Battery"
      headerRight={
        <DatePickerButton value={date} maximumDate={new Date()} onChange={onDateChange} />
      }>
      {!loading && !error ? <ChartInsightRow insights={insights} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <SolarAreaChart labels={labels} series={series} loading={loading} filled={false} />
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
