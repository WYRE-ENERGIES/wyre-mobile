import { StyleSheet, Text, View } from 'react-native';

import { ScorecardDoughnutChart } from '@/components/scorecard/scorecard-doughnut-chart';
import { WyreColors } from '@/constants/theme';
import {
  toneColor,
  type ScorecardGeneratorEntry,
  type ScorecardMetric,
  type ScorecardTone,
} from '@/lib/scorecard-metrics';

type ScorecardMetricCardProps = {
  metric: ScorecardMetric;
};

const TONE_PILL_BG: Record<ScorecardTone, string> = {
  good: '#dcfce7',
  warn: '#fef3c7',
  bad: '#fee2e2',
  neutral: '#f3e8ff',
};

function StatusPill({ tone, label }: { tone: ScorecardTone; label: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: TONE_PILL_BG[tone] }]}>
      <View style={[styles.pillDot, { backgroundColor: toneColor(tone) }]} />
      <Text style={[styles.pillText, { color: toneColor(tone) }]}>{label}</Text>
    </View>
  );
}

function GeneratorEntryBlock({ entry }: { entry: ScorecardGeneratorEntry }) {
  return (
    <View style={styles.generatorBlock}>
      <ScorecardDoughnutChart
        segments={entry.chart.segments}
        centerPrimary={entry.chart.centerPrimary}
        centerSecondary={entry.chart.centerSecondary}
        accentColor={entry.chart.accentColor}
        size={120}
      />

      <View style={styles.generatorDetails}>
        <Text style={styles.generatorName}>{entry.name}</Text>
        <Text style={styles.generatorSubtitle}>{entry.subtitle}</Text>
        {entry.detail ? <Text style={styles.generatorDetail}>{entry.detail}</Text> : null}
        {entry.status ? (
          <Text style={[styles.generatorStatus, { color: entry.status.color }]}>
            {entry.status.message}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export function ScorecardMetricCard({ metric }: ScorecardMetricCardProps) {
  const hasGenerators = metric.generatorEntries && metric.generatorEntries.length > 0;

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>{metric.title}</Text>
        {metric.status ? (
          <StatusPill tone={metric.status.tone} label={metric.status.label} />
        ) : null}
      </View>

      {!hasGenerators && metric.chart ? (
        <ScorecardDoughnutChart
          segments={metric.chart.segments}
          centerPrimary={metric.chart.centerPrimary}
          centerSecondary={metric.chart.centerSecondary}
          accentColor={metric.chart.accentColor}
        />
      ) : !hasGenerators ? (
        <View style={styles.headlineBlock}>
          <Text
            style={[
              styles.headline,
              metric.status ? { color: toneColor(metric.status.tone) } : null,
            ]}>
            {metric.headline}
          </Text>
          {metric.headlineHint ? (
            <Text style={styles.headlineHint}>{metric.headlineHint}</Text>
          ) : null}
        </View>
      ) : null}

      {hasGenerators ? (
        <View style={styles.generatorList}>
          {metric.generatorEntries!.map((entry, index) => (
            <View key={entry.key}>
              {index > 0 ? <View style={styles.generatorDivider} /> : null}
              <GeneratorEntryBlock entry={entry} />
            </View>
          ))}
        </View>
      ) : null}

      {metric.rows.length > 0 ? (
        <View style={styles.rows}>
          {metric.rows.map((row) => (
            <View key={row.label} style={styles.row}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={[styles.rowValue, row.accent ? { color: row.accent } : null]}>
                {row.value}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {metric.footerNote ? <Text style={styles.footerNote}>{metric.footerNote}</Text> : null}
      {metric.footer ? <Text style={styles.footer}>{metric.footer}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WyreColors.border,
    gap: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: WyreColors.textPrimary,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    flexShrink: 0,
  },
  pillDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  headlineBlock: {
    alignItems: 'center',
    paddingVertical: 8,
    gap: 2,
  },
  headline: {
    fontSize: 32,
    fontWeight: '700',
    color: WyreColors.purple,
    letterSpacing: -0.5,
  },
  headlineHint: {
    fontSize: 13,
    color: WyreColors.textSecondary,
  },
  generatorList: {
    gap: 0,
  },
  generatorDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: WyreColors.border,
    marginVertical: 12,
  },
  generatorBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  generatorDetails: {
    flex: 1,
    gap: 4,
  },
  generatorName: {
    fontSize: 14,
    fontWeight: '700',
    color: WyreColors.textPrimary,
  },
  generatorSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: WyreColors.textPrimary,
  },
  generatorDetail: {
    fontSize: 13,
    color: WyreColors.textSecondary,
  },
  generatorStatus: {
    fontSize: 13,
    fontWeight: '600',
  },
  rows: {
    gap: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: WyreColors.border,
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
    color: WyreColors.textSecondary,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '600',
    color: WyreColors.textPrimary,
    textAlign: 'right',
  },
  footerNote: {
    fontSize: 13,
    color: WyreColors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    fontSize: 12,
    color: WyreColors.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
