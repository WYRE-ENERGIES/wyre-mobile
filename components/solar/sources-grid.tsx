import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/context/theme-context';
import { formatKwh, formatNaira } from '@/lib/format';
import type { SolarYield, YieldTabKey } from '@/lib/solar-types';
import { YIELD_TABS } from '@/lib/solar-types';

const ICONS = {
  generation: 'sun.max.fill',
  battery: 'battery.100.bolt',
  load: 'house.fill',
  grid: 'powerplug.fill',
} as const satisfies Record<YieldTabKey, string>;

const SOURCE_ICON_COLOR = '#C865FF';

type SourcesGridProps = {
  data: SolarYield;
  selected: YieldTabKey;
  onSelect: (key: YieldTabKey) => void;
  onSeeMore: () => void;
  gridStatus?: 'ON' | 'OFF';
};

function GridStatusPill({ status }: { status: 'ON' | 'OFF' }) {
  const on = status === 'ON';
  return (
    <View
      style={[
        styles.statusPill,
        { backgroundColor: on ? 'rgba(34,197,94,0.16)' : 'rgba(239,68,68,0.14)' },
      ]}>
      <View style={[styles.statusDot, { backgroundColor: on ? '#22C55E' : '#EF4444' }]} />
      <Text style={[styles.statusText, { color: on ? '#16A34A' : '#DC2626' }]}>{status}</Text>
    </View>
  );
}

export function SourcesGrid({
  data,
  selected,
  onSelect,
  onSeeMore,
  gridStatus,
}: SourcesGridProps) {
  const { colors, isDark } = useAppTheme();
  const linkColor = isDark ? '#A855F7' : colors.accent;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.textOnPage }]}>Sources</Text>
          <View style={[styles.todayPill, { borderColor: colors.accentMuted, borderWidth: 1 }]}>
            <Text style={[styles.todayText, { color: colors.icon }]}>Today</Text>
          </View>
        </View>
        <Pressable onPress={onSeeMore} hitSlop={8}>
          <Text style={[styles.link, { color: linkColor }]}>View details</Text>
        </Pressable>
      </View>
      <View style={styles.grid}>
        {YIELD_TABS.map((tab) => {
          const showGridStatus = tab.key === 'grid' && (gridStatus === 'ON' || gridStatus === 'OFF');
          const batteryToday = tab.key === 'battery' ? data.battery.today : null;
          const energyToday = tab.key === 'battery' ? null : data[tab.key].today;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              accessibilityState={{ selected: tab.key === selected }}
              accessibilityLabel={
                showGridStatus
                  ? `View ${tab.label} energy details, grid ${gridStatus}`
                  : `View ${tab.label} energy details`
              }
              onPress={() => {
                onSelect(tab.key);
                onSeeMore();
              }}
              style={[
                styles.card,
                {
                  backgroundColor: colors.surface,
                },
              ]}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.iconWrap,
                    { backgroundColor: 'rgba(129, 129, 129, 0.12)' },
                  ]}>
                  <IconSymbol
                    name={ICONS[tab.key]}
                    size={22}
                    color={SOURCE_ICON_COLOR}
                  />
                </View>
                <Text style={[styles.cardLabel, { color: colors.textOnCard }]}>
                  {tab.label}
                </Text>
                {showGridStatus ? <GridStatusPill status={gridStatus} /> : null}
              </View>
              {batteryToday ? (
                <View style={styles.batteryMetrics}>
                  <View style={styles.batteryMetric}>
                    <Text
                      numberOfLines={1}
                      style={[styles.batteryValue, { color: colors.textOnCard }]}>
                      {formatKwh(batteryToday.charge_kwh, 0)}
                    </Text>
                    <Text style={[styles.batteryLabel, { color: colors.success }]}>Charged</Text>
                  </View>
                  <View style={[styles.batterySplit, { backgroundColor: colors.border }]} />
                  <View style={styles.batteryMetric}>
                    <Text
                      numberOfLines={1}
                      style={[styles.batteryValue, { color: colors.textOnCard }]}>
                      {formatKwh(batteryToday.discharge_kwh, 0)}
                    </Text>
                    <Text style={[styles.batteryLabel, { color: colors.textOnCardSecondary }]}>
                      Discharged
                    </Text>
                  </View>
                </View>
              ) : energyToday ? (
                <>
                  <Text style={[styles.cardCost, { color: colors.textOnCard }]}>
                    {formatNaira(energyToday.cost)}
                  </Text>
                  <Text style={[styles.cardKwh, { color: colors.textOnCardSecondary }]}>
                    {formatKwh(energyToday.kwh, 0)}
                  </Text>
                </>
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  title: {
    fontSize: 27,
    fontWeight: '800',
  },
  todayPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  todayText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  link: {
    fontSize: 14,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: '47.5%',
    borderRadius: 20,
    padding: 16,
    minHeight: 122,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 4,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cardCost: {
    fontSize: 20,
    fontWeight: '800',
  },
  cardKwh: {
    fontSize: 16,
    fontWeight: '600',
  },
  batteryMetrics: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 2,
  },
  batteryMetric: {
    flex: 1,
    gap: 3,
  },
  batterySplit: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    marginVertical: 2,
  },
  batteryValue: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  batteryLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
