import { StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/context/theme-context';
import { formatKwh, formatNaira, formatNumber } from '@/lib/format';
import type { DieselOverviewData } from '@/lib/diesel-types';

type DieselSummaryCardsProps = {
  data: DieselOverviewData;
};

export function DieselSummaryCards({ data }: DieselSummaryCardsProps) {
  const { colors } = useAppTheme();
  const primary = data.generators[0];
  const energy = data.energyGenerators[0]?.energy ?? data.totalEnergy;

  return (
    <View style={styles.wrap}>
      <View style={[styles.hero, { backgroundColor: colors.surface }]}>
        <View style={[styles.icon, { backgroundColor: colors.accent }]}>
          <IconSymbol name="gearshape.fill" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.heroCopy}>
          <Text style={[styles.heroTitle, { color: colors.textOnCard }]}>
            {primary?.name ?? 'Generator'} — {formatKwh(energy, 0)} used
          </Text>
          <Text style={[styles.heroMeta, { color: colors.textOnCardSecondary }]}>
            Last used{' '}
            <Text style={{ fontWeight: '700' }}>
              {primary?.last_usage_time_relative || '—'}
            </Text>
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        <StatCard
          icon="cloud.fill"
          label="CO Emission"
          value={`${formatNumber(data.co2Tonnes, 2)} tons`}
        />
        <StatCard
          icon="tag.fill"
          label="Price / Litre"
          value={formatNaira(data.price.diesel_price_per_litre)}
        />
        <StatCard
          icon="gauge.with.dots.needle.33percent"
          label="Diesel Efficiency"
          value={`${formatNumber(data.price.diesel_efficiency, 0)} kWh/L`}
        />
        <StatCard
          icon="banknote.fill"
          label="Cost (est. Monthly)"
          value={formatNaira(data.price.month_estimated_cost)}
        />
      </View>
    </View>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: 'cloud.fill' | 'tag.fill' | 'gauge.with.dots.needle.33percent' | 'banknote.fill';
  label: string;
  value: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.stat, { backgroundColor: colors.surface }]}>
      <IconSymbol name={icon} size={18} color={colors.accent} />
      <Text style={[styles.statLabel, { color: colors.textOnCardSecondary }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.textOnCard }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    gap: 12,
  },
  hero: {
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  heroMeta: {
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  stat: {
    width: '47.5%',
    borderRadius: 20,
    padding: 14,
    minHeight: 92,
    gap: 6,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
  },
});
