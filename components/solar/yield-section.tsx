import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { SolarCard } from '@/components/solar/solar-card';
import { WyreColors } from '@/constants/theme';
import { formatPlainNumber } from '@/lib/format';
import type { SolarYield, YieldTabKey } from '@/lib/solar-types';
import { YIELD_PERIOD_LABELS, YIELD_TABS } from '@/lib/solar-types';

type YieldSectionProps = {
  data: SolarYield;
};

export function YieldSection({ data }: YieldSectionProps) {
  const [activeTab, setActiveTab] = useState<YieldTabKey>('generation');
  const tabData = data?.[activeTab];
  const periodLabels = YIELD_PERIOD_LABELS[activeTab];

  if (!tabData) {
    return (
      <SolarCard>
        <Text style={styles.periodLabel}>Energy summary unavailable</Text>
      </SolarCard>
    );
  }

  return (
    <SolarCard style={styles.card}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabScroll}
        contentContainerStyle={styles.tabBar}>
        {YIELD_TABS.map((tab) => {
          const selected = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              style={[styles.tab, selected && styles.tabSelected]}
              onPress={() => setActiveTab(tab.key)}>
              <Text style={[styles.tabText, selected && styles.tabTextSelected]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.periodList}>
        {(['total', 'today', 'monthly'] as const).map((period) => {
          const values = tabData[period] ?? { kwh: 0, cost: 0 };
          return (
            <View key={period} style={styles.periodRow}>
              <Text style={styles.periodLabel} numberOfLines={2}>
                {periodLabels[period]}
              </Text>
              <View style={styles.periodValues}>
                <Text style={styles.kwh} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                  {formatPlainNumber(values.kwh)}{' '}
                  <Text style={styles.kwhUnit}>kWh</Text>
                </Text>
                <Text style={styles.cost} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.85}>
                  {formatPlainNumber(values.cost)}{' '}
                  <Text style={styles.ngnUnit}>NGN</Text>
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </SolarCard>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 0,
  },
  tabScroll: {
    flexGrow: 0,
    flexShrink: 0,
  },
  tabBar: {
    gap: 24,
    paddingBottom: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: WyreColors.border,
    marginBottom: 12,
  },
  tab: {
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -StyleSheet.hairlineWidth,
  },
  tabSelected: {
    borderBottomColor: WyreColors.purple,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: WyreColors.textSecondary,
  },
  tabTextSelected: {
    color: WyreColors.purple,
    fontWeight: '600',
  },
  periodList: {
    gap: 16,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  periodLabel: {
    flex: 1,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    paddingTop: 1,
  },
  periodValues: {
    flexShrink: 1,
    maxWidth: '58%',
    alignItems: 'flex-end',
    gap: 4,
  },
  kwh: {
    fontSize: 13,
    fontWeight: '500',
    color: '#999999',
    textAlign: 'right',
  },
  kwhUnit: {
    color: '#999999',
  },
  cost: {
    fontSize: 13,
    fontWeight: '500',
    color: '#999999',
    textAlign: 'right',
  },
  ngnUnit: {
    color: '#00b140',
  },
});
