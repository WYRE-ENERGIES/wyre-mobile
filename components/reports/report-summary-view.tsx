import { StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/context/theme-context';
import { formatKwh, withSourcePercents } from '@/lib/report/helpers';
import type { MonthlyReportModel } from '@/lib/report/types';

function numberFromText(value: string): number {
  const parsed = Number(value.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function ReportSummaryView({ report }: { report: MonthlyReportModel }) {
  const { colors } = useAppTheme();
  const sources = withSourcePercents(report.sources).sort((a, b) => b.valueKwh - a.valueKwh);
  const dominant = sources[0];
  const solarShare =
    report.totalEnergyKwh > 0 ? (report.solarHourKwh / report.totalEnergyKwh) * 100 : 0;
  const peakDemand = Math.max(...report.powerDemand.map((item) => numberFromText(item.peak)), 0);
  const currentEfficiency = numberFromText(report.currentEfficiency.value);

  const insights = [
    dominant?.valueKwh
      ? `${dominant.label} supplied ${dominant.percent.toFixed(0)}% of recorded energy, making it the main source this period.`
      : 'No dominant energy source was recorded for this period.',
    solarShare > 0
      ? `${formatKwh(report.solarHourKwh)} kWh (${solarShare.toFixed(0)}%) was used during solar hours—an opportunity for cleaner energy coverage.`
      : 'No solar-hours consumption opportunity was recorded for this period.',
    peakDemand > 0
      ? `Peak demand reached ${peakDemand.toLocaleString()} kW. Review high-load periods before increasing capacity.`
      : 'There was not enough demand data to identify a peak.',
  ];

  return (
    <View style={styles.wrap}>
      <View style={[styles.hero, { backgroundColor: colors.surface }]}>
        <View style={styles.heroTop}>
          <View style={[styles.aiIcon, { backgroundColor: colors.accentMuted }]}>
            <IconSymbol name="bolt.fill" size={19} color={colors.accent} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={[styles.eyebrow, { color: colors.accent }]}>SMART SUMMARY</Text>
            <Text style={[styles.period, { color: colors.textOnCardSecondary }]}>
              {report.monthLabel} {report.year} · {report.branchName}
            </Text>
          </View>
        </View>
        <Text style={[styles.heroValue, { color: colors.textOnCard }]}>
          {formatKwh(report.totalEnergyKwh)}
          <Text style={[styles.heroUnit, { color: colors.textOnCardSecondary }]}> kWh</Text>
        </Text>
        <Text style={[styles.heroLabel, { color: colors.textOnCardSecondary }]}>
          Total energy consumed
        </Text>
      </View>

      <View style={[styles.metrics, { backgroundColor: colors.surface }]}>
        <Metric
          label="Top source"
          value={dominant?.label ?? '—'}
          detail={dominant ? `${dominant.percent.toFixed(0)}% of energy` : 'No data'}
          index={0}
        />
        <Metric
          label="Solar-hours use"
          value={`${solarShare.toFixed(0)}%`}
          detail={`${formatKwh(report.solarHourKwh)} kWh`}
          index={1}
        />
        <Metric
          label="Peak demand"
          value={peakDemand ? `${peakDemand.toLocaleString()} kW` : '—'}
          detail="Highest recorded load"
          index={2}
        />
        <Metric
          label="Efficiency"
          value={currentEfficiency ? `${currentEfficiency}%` : '—'}
          detail={report.currentEfficiency.label}
          index={3}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.textOnCard }]}>What this means</Text>
        <Text style={[styles.cardHint, { color: colors.textOnCardSecondary }]}>
          A plain-language reading of this report’s key signals.
        </Text>
        <View style={styles.insights}>
          {insights.map((insight, index) => (
            <View key={insight} style={styles.insight}>
              <View style={[styles.index, { backgroundColor: colors.surfaceMuted }]}>
                <Text style={[styles.indexText, { color: colors.accent }]}>{index + 1}</Text>
              </View>
              <Text style={[styles.insightText, { color: colors.textOnCardSecondary }]}>
                {insight}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text style={[styles.cardTitle, { color: colors.textOnCard }]}>Energy source mix</Text>
        <Text style={[styles.cardHint, { color: colors.textOnCardSecondary }]}>
          Where recorded energy came from.
        </Text>
        <View style={styles.sourceList}>
          {sources.filter((source) => source.valueKwh > 0).slice(0, 5).map((source) => (
            <View key={source.label} style={styles.source}>
              <View style={styles.sourceHeader}>
                <Text style={[styles.sourceName, { color: colors.textOnCard }]}>
                  {source.label}
                </Text>
                <Text style={[styles.sourceValue, { color: colors.textOnCardSecondary }]}>
                  {formatKwh(source.valueKwh)} kWh · {source.percent.toFixed(0)}%
                </Text>
              </View>
              <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${Math.max(source.percent, 2)}%`,
                      backgroundColor: source.color,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function Metric({
  label,
  value,
  detail,
  index,
}: {
  label: string;
  value: string;
  detail: string;
  index: number;
}) {
  const { colors } = useAppTheme();
  return (
    <View
      style={[
        styles.metric,
        index < 2 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
        index % 2 === 0 && { borderRightColor: colors.border, borderRightWidth: StyleSheet.hairlineWidth },
      ]}>
      <Text style={[styles.metricLabel, { color: colors.textOnCardSecondary }]}>{label}</Text>
      <Text
        numberOfLines={2}
        adjustsFontSizeToFit
        minimumFontScale={0.72}
        style={[styles.metricValue, { color: colors.textOnCard }]}>
        {value}
      </Text>
      <Text numberOfLines={1} style={[styles.metricDetail, { color: colors.textOnCardSecondary }]}>
        {detail}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  hero: { borderRadius: 22, padding: 18 },
  heroTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  aiIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  heroCopy: { flex: 1 },
  eyebrow: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  period: { marginTop: 3, fontSize: 12 },
  heroValue: { marginTop: 18, fontSize: 34, fontWeight: '800', letterSpacing: -1 },
  heroUnit: { fontSize: 16, fontWeight: '600' },
  heroLabel: { marginTop: 2, fontSize: 12 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', borderRadius: 22, overflow: 'hidden' },
  metric: { width: '50%', minHeight: 112, paddingHorizontal: 16, paddingVertical: 17 },
  metricLabel: { fontSize: 11, fontWeight: '600' },
  metricValue: { marginTop: 7, fontSize: 17, lineHeight: 21, fontWeight: '800' },
  metricDetail: { marginTop: 4, fontSize: 10 },
  card: { borderRadius: 22, padding: 16 },
  cardTitle: { fontSize: 17, fontWeight: '800' },
  cardHint: { marginTop: 3, fontSize: 11, lineHeight: 16 },
  insights: { marginTop: 15, gap: 14 },
  insight: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  index: { width: 26, height: 26, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  indexText: { fontSize: 11, fontWeight: '900' },
  insightText: { flex: 1, fontSize: 12, lineHeight: 18 },
  sourceList: { marginTop: 16, gap: 14 },
  source: { gap: 7 },
  sourceHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  sourceName: { flex: 1, fontSize: 11, fontWeight: '700' },
  sourceValue: { fontSize: 10 },
  track: { height: 7, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
});
