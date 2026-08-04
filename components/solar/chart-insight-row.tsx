import { StyleSheet, Text, View } from 'react-native';

import { WyreColors } from '@/constants/theme';

export type ChartInsight = {
  label: string;
  value: string;
  accent?: string;
};

type ChartInsightRowProps = {
  insights: ChartInsight[];
};

export function ChartInsightRow({ insights }: ChartInsightRowProps) {
  if (!insights.length) return null;

  return (
    <View style={styles.row}>
      {insights.map((insight) => (
        <View key={insight.label} style={styles.item}>
          <View style={styles.labelRow}>
            {insight.accent ? (
              <View style={[styles.accent, { backgroundColor: insight.accent }]} />
            ) : null}
            <Text style={styles.label} numberOfLines={1}>
              {insight.label}
            </Text>
          </View>
          <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
            {insight.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  item: {
    flex: 1,
    minWidth: 0,
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: WyreColors.border,
    backgroundColor: '#FAFAFC',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  accent: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    flexShrink: 1,
    fontSize: 10,
    color: WyreColors.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: WyreColors.textPrimary,
  },
});
