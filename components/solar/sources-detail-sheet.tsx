import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { DetailSheet } from '@/components/wyre/detail-sheet';
import { TodayEnergyChart } from '@/components/solar/today-energy-chart';
import { useAppTheme } from '@/context/theme-context';
import { useConsumptionChart } from '@/hooks/use-consumption-chart';
import { formatKwh, formatNaira } from '@/lib/format';
import type { SolarYield, YieldTab, YieldTabKey } from '@/lib/solar-types';
import { YIELD_PERIOD_LABELS, YIELD_TABS } from '@/lib/solar-types';

type SourcesDetailSheetProps = {
  visible: boolean;
  onClose: () => void;
  selected: YieldTabKey;
  yieldData: SolarYield | null;
  branchId: number;
};

const PERIODS: (keyof YieldTab)[] = ['today', 'monthly', 'total'];

const SOURCE_ICONS = {
  generation: 'sun.max.fill',
  battery: 'battery.100.bolt',
  load: 'house.fill',
  grid: 'powerplug.fill',
} as const satisfies Record<YieldTabKey, string>;

const SOURCE_COLORS: Record<YieldTabKey, string> = {
  generation: '#F59E0B',
  battery: '#22C55E',
  load: '#60A5FA',
  grid: '#A3A3A3',
};

const SOURCE_DESCRIPTIONS: Record<YieldTabKey, string> = {
  generation: 'Energy produced by your solar panels',
  battery: 'Energy stored and supplied by your battery',
  load: 'Energy consumed by your home or site',
  grid: 'Energy imported from the utility grid',
};

export function SourcesDetailSheet({
  visible,
  onClose,
  selected,
  yieldData,
  branchId,
}: SourcesDetailSheetProps) {
  const { colors, isDark } = useAppTheme();
  const [activeSource, setActiveSource] = useState<YieldTabKey>(selected);
  const chart = useConsumptionChart(visible ? branchId : null);
  const tab = yieldData?.[activeSource];
  const labels = YIELD_PERIOD_LABELS[activeSource];
  const activeLabel = YIELD_TABS.find((item) => item.key === activeSource)?.label ?? 'Source';

  useEffect(() => {
    if (visible) setActiveSource(selected);
  }, [selected, visible]);

  return (
    <DetailSheet
      visible={visible}
      title="Energy sources"
      onClose={onClose}>
      <Text style={[styles.intro, { color: colors.textOnCardSecondary }]}>
        See where your energy comes from, where it goes, and its estimated value.
      </Text>

      <View style={[styles.tabs, { backgroundColor: colors.surfaceMuted }]}>
        {YIELD_TABS.map((source) => {
          const active = source.key === activeSource;
          return (
            <Pressable
              key={source.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => setActiveSource(source.key)}
              style={[
                styles.tab,
                active && {
                  backgroundColor: isDark ? colors.surface : '#FFFFFF',
                },
              ]}>
              <IconSymbol
                name={SOURCE_ICONS[source.key]}
                size={18}
                color={active ? SOURCE_COLORS[source.key] : colors.textOnCardSecondary}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.tabLabel,
                  {
                    color: active
                      ? colors.textOnCard
                      : colors.textOnCardSecondary,
                  },
                ]}>
                {source.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.sourceHeading}>
        <View
          style={[
            styles.sourceIcon,
            { backgroundColor: `${SOURCE_COLORS[activeSource]}1F` },
          ]}>
          <IconSymbol
            name={SOURCE_ICONS[activeSource]}
            size={24}
            color={SOURCE_COLORS[activeSource]}
          />
        </View>
        <View style={styles.sourceHeadingText}>
          <Text style={[styles.sourceTitle, { color: colors.textOnCard }]}>{activeLabel}</Text>
          <Text style={[styles.sourceDescription, { color: colors.textOnCardSecondary }]}>
            {SOURCE_DESCRIPTIONS[activeSource]}
          </Text>
        </View>
      </View>

      {tab
        ? (
            <View
              style={[
                styles.breakdown,
                { backgroundColor: colors.surfaceMuted },
              ]}>
              {PERIODS.map((period, index) => (
                <View key={period}>
                  <View style={styles.row}>
                    <View style={styles.period}>
                      <Text style={[styles.label, { color: colors.textOnCard }]}>
                        {labels[period]}
                      </Text>
                      <Text style={[styles.valueHint, { color: colors.textOnCardSecondary }]}>
                        Estimated value
                      </Text>
                    </View>
                    <View style={styles.values}>
                      <Text style={[styles.kwh, { color: colors.textOnCard }]}>
                        {formatKwh(tab[period].kwh, 1)}
                      </Text>
                      <Text style={[styles.cost, { color: colors.success }]}>
                        {formatNaira(tab[period].cost, 2)}
                      </Text>
                    </View>
                  </View>
                  {index < PERIODS.length - 1 ? (
                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                  ) : null}
                </View>
              ))}
            </View>
          )
        : null}

      <Text style={[styles.chartTitle, { color: colors.textOnCard }]}>
        Today’s {activeLabel.toLowerCase()} pattern
      </Text>
      <Text style={[styles.chartHint, { color: colors.textOnCardSecondary }]}>
        Your energy activity throughout the day.
      </Text>
      <View
        style={[
          styles.chartCard,
          { backgroundColor: colors.surfaceMuted },
        ]}>
        <TodayEnergyChart data={chart.data} source={activeSource} />
      </View>
    </DetailSheet>
  );
}

const styles = StyleSheet.create({
  intro: {
    marginTop: -8,
    fontSize: 13,
    lineHeight: 19,
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    gap: 3,
  },
  tab: {
    flex: 1,
    minHeight: 58,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingHorizontal: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  sourceHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 2,
  },
  sourceIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceHeadingText: {
    flex: 1,
    gap: 2,
  },
  sourceTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  sourceDescription: {
    fontSize: 12,
    lineHeight: 17,
  },
  breakdown: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  row: {
    minHeight: 76,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  period: {
    flex: 1,
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
  valueHint: {
    fontSize: 11,
  },
  values: {
    alignItems: 'flex-end',
    gap: 4,
  },
  kwh: {
    fontSize: 16,
    fontWeight: '800',
  },
  cost: {
    fontSize: 13,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },
  chartTitle: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '700',
  },
  chartHint: {
    fontSize: 13,
    marginTop: -8,
  },
  chartCard: {
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
});
