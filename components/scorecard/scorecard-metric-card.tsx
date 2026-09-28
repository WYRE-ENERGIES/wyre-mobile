import { StyleSheet, Text, View } from 'react-native';

import { ScorecardDoughnutChart } from '@/components/scorecard/scorecard-doughnut-chart';
import { useAppTheme } from '@/context/theme-context';
import {
  toneColor,
  type ScorecardGeneratorEntry,
  type ScorecardMetric,
} from '@/lib/scorecard-metrics';

type ScorecardMetricCardProps = {
  metric: ScorecardMetric;
};

function GeneratorEntryBlock({ entry }: { entry: ScorecardGeneratorEntry }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.generatorBlock}>
      <ScorecardDoughnutChart
        segments={entry.chart.segments}
        centerPrimary={entry.chart.centerPrimary}
        centerSecondary={entry.chart.centerSecondary}
        accentColor={entry.chart.accentColor}
        size={88}
      />

      <View style={styles.sideCopy}>
        <Text style={[styles.generatorName, { color: colors.textOnCard }]}>{entry.name}</Text>
        <Text style={[styles.headline, { color: colors.textOnCard }]}>{entry.subtitle}</Text>
        {entry.detail ? (
          <Text style={[styles.hint, { color: colors.textOnCardSecondary }]}>{entry.detail}</Text>
        ) : null}
        {entry.status ? (
          <Text style={[styles.status, { color: entry.status.color }]}>{entry.status.message}</Text>
        ) : null}
      </View>
    </View>
  );
}

export function ScorecardMetricCard({ metric }: ScorecardMetricCardProps) {
  const { colors } = useAppTheme();
  const hasGenerators = Boolean(metric.generatorEntries?.length);
  const statusColor = metric.status ? toneColor(metric.status.tone) : colors.textOnCard;
  const headline = metric.headline.trim() && metric.headline !== '—' ? metric.headline : '';

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.textOnCard }]}>{metric.title}</Text>

      {metric.unavailable ? (
        <Text style={[styles.hint, { color: colors.textOnCardSecondary }]}>
          This metric could not be loaded. Pull to refresh.
        </Text>
      ) : hasGenerators ? (
        <View style={styles.generatorList}>
          {metric.generatorEntries!.map((entry, index) => (
            <View key={entry.key}>
              {index > 0 ? (
                <View style={[styles.generatorDivider, { backgroundColor: colors.border }]} />
              ) : null}
              <GeneratorEntryBlock entry={entry} />
            </View>
          ))}
        </View>
      ) : metric.chart && headline ? (
        <View style={styles.hero}>
          <ScorecardDoughnutChart
            segments={metric.chart.segments}
            centerPrimary={metric.chart.centerPrimary}
            centerSecondary={metric.chart.centerSecondary}
            accentColor={metric.chart.accentColor}
          />
          <View style={styles.sideCopy}>
            <Text style={[styles.headline, { color: statusColor }]}>{headline}</Text>
            {metric.headlineHint ? (
              <Text style={[styles.hint, { color: colors.textOnCardSecondary }]}>
                {metric.headlineHint}
              </Text>
            ) : null}
            {metric.status ? (
              <Text style={[styles.status, { color: statusColor }]}>{metric.status.label}</Text>
            ) : null}
          </View>
        </View>
      ) : (
        <View style={styles.headlineBlock}>
          {headline ? (
            <Text style={[styles.headlineLarge, { color: statusColor }]}>{headline}</Text>
          ) : null}
          {metric.headlineHint ? (
            <Text style={[styles.hint, { color: colors.textOnCardSecondary }]}>
              {metric.headlineHint}
            </Text>
          ) : null}
          {metric.status ? (
            <Text style={[styles.status, { color: statusColor }]}>{metric.status.label}</Text>
          ) : null}
        </View>
      )}

      {metric.rows.length > 0 ? (
        <View style={[styles.rows, { borderTopColor: colors.border }]}>
          {metric.rows.map((row) => (
            <View key={row.label} style={styles.row}>
              <Text style={[styles.rowLabel, { color: colors.textOnCardSecondary }]}>
                {row.label}
              </Text>
              <Text
                style={[
                  styles.rowValue,
                  { color: colors.textOnCard },
                  row.accent ? { color: row.accent } : null,
                ]}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {metric.footerNote ? (
        <Text style={[styles.footerNote, { color: colors.textOnCardSecondary }]}>
          {metric.footerNote}
        </Text>
      ) : null}
      {metric.footer && !metric.unavailable ? (
        <Text style={[styles.footer, { color: colors.textOnCardSecondary }]}>{metric.footer}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  sideCopy: {
    flex: 1,
    gap: 4,
  },
  headline: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  headlineLarge: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headlineBlock: {
    gap: 4,
  },
  hint: {
    fontSize: 13,
  },
  status: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  generatorList: {
    gap: 0,
  },
  generatorDivider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: 12,
  },
  generatorBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  generatorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  rows: {
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  rowLabel: {
    flex: 1,
    fontSize: 13,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  footerNote: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    fontSize: 12,
    lineHeight: 18,
  },
});
