import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/context/theme-context';
import { toneColor, type ScorecardMetric } from '@/lib/scorecard-metrics';

type ScorecardSummaryProps = {
  metrics: ScorecardMetric[];
  dateLabel: string;
};

function attentionMetrics(metrics: ScorecardMetric[]) {
  return metrics.filter(
    (metric) => metric.status && (metric.status.tone === 'bad' || metric.status.tone === 'warn'),
  );
}

export function ScorecardSummary({ metrics, dateLabel }: ScorecardSummaryProps) {
  const { colors } = useAppTheme();
  const flagged = attentionMetrics(metrics);
  const withReadings = metrics.filter((metric) => metric.status && metric.status.tone !== 'neutral');

  return (
    <View style={styles.wrap}>
      <Text style={[styles.intro, { color: colors.textOnPageMuted }]}>
        Site performance for {dateLabel}.
      </Text>

      {flagged.length > 0 ? (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.textOnCard }]}>
            {flagged.length === 1 ? '1 metric needs attention' : `${flagged.length} metrics need attention`}
          </Text>
          {flagged.map((metric) => (
            <View key={metric.key} style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textOnCard }]} numberOfLines={1}>
                {metric.title}
              </Text>
              <Text
                style={[styles.rowValue, { color: toneColor(metric.status!.tone) }]}
                numberOfLines={1}>
                {metric.status!.label}
              </Text>
            </View>
          ))}
        </View>
      ) : withReadings.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textOnPageMuted }]}>
          Readings will show here once this month's data is available.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12,
  },
  intro: {
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    gap: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 13,
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
    maxWidth: '46%',
    textAlign: 'right',
  },
  empty: {
    fontSize: 13,
    lineHeight: 18,
  },
});
