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
};

export function SourcesGrid({ data, selected, onSelect, onSeeMore }: SourcesGridProps) {
  const { colors, isDark } = useAppTheme();
  const linkColor = isDark ? '#A855F7' : colors.accent;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textOnPage }]}>Sources</Text>
        <Pressable onPress={onSeeMore} hitSlop={8}>
          <Text style={[styles.link, { color: linkColor }]}>View details</Text>
        </Pressable>
      </View>
      <View style={styles.grid}>
        {YIELD_TABS.map((tab) => {
          const active = tab.key === selected;
          const today = data[tab.key].today;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              accessibilityLabel={`View ${tab.label} energy details`}
              onPress={() => {
                onSelect(tab.key);
                onSeeMore();
              }}
              style={[
                styles.card,
                {
                  backgroundColor: isDark
                    ? colors.surface
                    : active
                      ? colors.accentMuted
                      : colors.surface,
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
              </View>
              <Text
                style={[
                  styles.cardCost,
                  { color: colors.textOnCard },
                ]}>
                {formatNaira(today.cost)}
              </Text>
              <Text
                style={[
                  styles.cardKwh,
                  {
                    color: colors.textOnCardSecondary,
                  },
                ]}>
                {formatKwh(today.kwh, 0)}
              </Text>
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
  title: {
    fontSize: 27,
    fontWeight: '800',
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
  cardCost: {
    fontSize: 20,
    fontWeight: '800',
  },
  cardKwh: {
    fontSize: 16,
    fontWeight: '600',
  },
});
