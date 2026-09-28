import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { DetailSheet } from '@/components/wyre/detail-sheet';
import { useAppTheme } from '@/context/theme-context';
import { useDieselDetails } from '@/hooks/use-diesel-overview';
import { formatNaira, formatNumber } from '@/lib/format';

type DieselDetailsSheetProps = {
  visible: boolean;
  onClose: () => void;
  branchId: number | null;
  month: number;
  year: number;
};

export function DieselDetailsSheet({
  visible,
  onClose,
  branchId,
  month,
  year,
}: DieselDetailsSheetProps) {
  const { colors } = useAppTheme();
  const { data, loading, error } = useDieselDetails(branchId, month, year, visible);
  const latest = data?.fuelSeries?.slice(-7) ?? [];

  return (
    <DetailSheet visible={visible} title="Fuel & cost details" onClose={onClose}>
      {loading ? <ActivityIndicator color={colors.accent} /> : null}
      {error ? (
        <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
      ) : null}

      <Text style={[styles.heading, { color: colors.textOnCard }]}>Recent fuel use</Text>
      <Text style={[styles.hint, { color: colors.textOnCardSecondary }]}>
        Reported litres vs what the energy system expected.
      </Text>
      {latest.length === 0 ? (
        <Text style={[styles.hint, { color: colors.textOnCardSecondary }]}>
          No fuel readings for this month.
        </Text>
      ) : (
        latest.map((point) => (
          <View key={point.date} style={[styles.row, { backgroundColor: colors.surfaceMuted }]}>
            <Text style={[styles.label, { color: colors.textOnCard }]}>{point.date}</Text>
            <Text style={[styles.value, { color: colors.textOnCardSecondary }]}>
              {formatNumber(point.fuel_liters, 0)} L reported
            </Text>
            <Text style={[styles.value, { color: colors.textOnCardSecondary }]}>
              {formatNumber(point.predicted_liters, 0)} L expected
            </Text>
          </View>
        ))
      )}

      <Text style={[styles.heading, { color: colors.textOnCard }]}>Efficiency</Text>
      <Metric label="Fuel efficiency" value={`${formatNumber(data?.fuelEfficiency, 1)} kWh/L`} />
      <Metric
        label="Generator score"
        value={`${formatNumber(data?.efficiencyScore, 0)}%`}
      />

      <Text style={[styles.heading, { color: colors.textOnCard }]}>Cost</Text>
      <Metric label="Total cost" value={formatNaira(data?.totalCost)} />
      <Metric label="Cost per kWh" value={formatNaira(data?.blendedCost)} />
      <Metric label="Annual forecast" value={formatNaira(data?.annualCost)} />
    </DetailSheet>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.metric, { backgroundColor: colors.surfaceMuted }]}>
      <Text style={[styles.label, { color: colors.textOnCardSecondary }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: colors.textOnCard }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 6,
  },
  hint: {
    fontSize: 13,
    marginTop: -6,
  },
  error: {
    fontSize: 14,
  },
  row: {
    borderRadius: 14,
    padding: 12,
    gap: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  value: {
    fontSize: 12,
  },
  metric: {
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '800',
  },
});
