import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { BatteryIndicator } from '@/components/solar/battery-indicator';
import { CircleGauge } from '@/components/solar/circle-gauge';
import { SolarCard } from '@/components/solar/solar-card';
import { WyreColors } from '@/constants/theme';
import type { SiteNode, SolarOverview } from '@/lib/solar-types';

type LiveOverviewCardProps = {
  data: SolarOverview;
  battery?: SiteNode | null;
};

function getBatteryStatus(kw: number): { label: string; color: string } {
  if (kw > 0) return { label: 'Discharging', color: '#58B90A' };
  if (kw < 0) return { label: 'Charging', color: '#7B61FF' };
  return { label: 'Idle', color: WyreColors.textSecondary };
}

export function LiveOverviewCard({ data, battery }: LiveOverviewCardProps) {
  const weather = data?.weather;
  const metrics = data?.metrics;
  const percentage = metrics?.percentage_usage ?? 0;
  const pvProduction = metrics?.pv_production_kw ?? 0;
  const installedCapacity = metrics?.installed_capacity_kWp ?? 0;

  const batteryKw = battery?.kw ?? 0;
  const batterySoc = battery?.percentage ?? 0;
  const batteryStatus = getBatteryStatus(batteryKw);
  const gaugeSize = 132;

  return (
    <SolarCard style={styles.card}>
      <View style={styles.header}>
        <View style={styles.locationRow}>
          <Ionicons name="location-outline" size={16} color={WyreColors.textSecondary} />
          <Text style={styles.locationText}>
            {weather?.city || '—'} — {weather?.condition || '—'}{' '}
            {weather?.temperature_c != null ? `${weather.temperature_c}°C` : '—'}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.sunRow}>
            <Ionicons name="sunny-outline" size={16} color={WyreColors.textSecondary} />
            <Text style={styles.metaText}>Sunshine</Text>
            <Text style={styles.metaText}>{weather?.sunshine || '—'}</Text>
            <Text style={styles.metaText}>(UTC+01)</Text>
          </View>

          <View style={styles.capacityChip}>
            <MaterialCommunityIcons name="flash" size={14} color={WyreColors.purple} />
            <Text style={styles.capacityText}>
              {installedCapacity} kWp installed
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.gaugesRow}>
        <View style={styles.gaugeBlock}>
          <CircleGauge
            percentage={percentage}
            size={gaugeSize}
            segments={30}
            label="Power"
          />
          <Text style={styles.gaugeTitle}>Solar</Text>
          <Text style={styles.gaugeValue}>{pvProduction} kW</Text>
          <Text style={styles.gaugeHint}>PV production</Text>
        </View>

        <View style={styles.gaugeBlock}>
          <BatteryIndicator
            percentage={batterySoc}
            size={gaugeSize}
            charging={batteryKw < 0}
          />
          <Text style={styles.gaugeTitle}>Battery</Text>
          <Text style={styles.gaugeValue}>{Math.abs(batteryKw).toFixed(2)} kW</Text>
          <Text style={[styles.gaugeHint, { color: batteryStatus.color }]}>
            {batteryStatus.label}
          </Text>
        </View>
      </View>
    </SolarCard>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 260,
  },
  header: {
    gap: 10,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: WyreColors.textSecondary,
  },
  metaRow: {
    gap: 8,
  },
  sunRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 12,
    color: WyreColors.textSecondary,
  },
  capacityChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(92, 18, 167, 0.08)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  capacityText: {
    fontSize: 12,
    fontWeight: '600',
    color: WyreColors.purple,
  },
  gaugesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 12,
    paddingBottom: 4,
  },
  gaugeBlock: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  gaugeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: WyreColors.textPrimary,
    marginTop: 2,
  },
  gaugeValue: {
    fontSize: 15,
    fontWeight: '700',
    color: WyreColors.textPrimary,
  },
  gaugeHint: {
    fontSize: 11,
    color: WyreColors.textSecondary,
  },
});
