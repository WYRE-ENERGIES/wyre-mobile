import { StyleSheet, Text, View } from 'react-native';

import { WyreColors } from '@/constants/theme';
import {
  toneColor,
  type ScorecardMetric,
  type ScorecardTone,
} from '@/lib/scorecard-metrics';

type ScorecardSummaryProps = {
  metrics: ScorecardMetric[];
  dateLabel: string;
};

const TONE_PILL_BG: Record<ScorecardTone, string> = {
  good: '#dcfce7',
  warn: '#fef3c7',
  bad: '#fee2e2',
  neutral: '#f3e8ff',
};

function countByTone(metrics: ScorecardMetric[]) {
  const counts: Record<ScorecardTone, number> = {
    good: 0,
    warn: 0,
    bad: 0,
    neutral: 0,
  };

  for (const metric of metrics) {
    const tone = metric.status?.tone ?? 'neutral';
    counts[tone] += 1;
  }

  return counts;
}

function overallLabel(counts: Record<ScorecardTone, number>): {
  tone: ScorecardTone;
  label: string;
} {
  if (counts.bad > 0) {
    return {
      tone: 'bad',
      label: counts.bad === 1 ? '1 metric needs action' : `${counts.bad} metrics need action`,
    };
  }
  if (counts.warn > 0) {
    return {
      tone: 'warn',
      label:
        counts.warn === 1
          ? '1 metric needs attention'
          : `${counts.warn} metrics need attention`,
    };
  }
  if (counts.good > 0) {
    return { tone: 'good', label: 'Site performing well' };
  }
  return { tone: 'neutral', label: 'Awaiting scorecard data' };
}

export function ScorecardSummary({ metrics, dateLabel }: ScorecardSummaryProps) {
  const counts = countByTone(metrics);
  const overall = overallLabel(counts);
  const actionable = metrics.filter(
    (metric) => metric.status && (metric.status.tone === 'bad' || metric.status.tone === 'warn'),
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>At a glance</Text>
          <Text style={styles.period}>{dateLabel}</Text>
        </View>
        <View style={[styles.overallPill, { backgroundColor: TONE_PILL_BG[overall.tone] }]}>
          <View style={[styles.dot, { backgroundColor: toneColor(overall.tone) }]} />
          <Text style={[styles.overallText, { color: toneColor(overall.tone) }]}>
            {overall.label}
          </Text>
        </View>
      </View>

      <View style={styles.counts}>
        {(
          [
            { tone: 'good', label: 'On track' },
            { tone: 'warn', label: 'Watch' },
            { tone: 'bad', label: 'Action' },
          ] as const
        ).map((item) => (
          <View key={item.tone} style={styles.countItem}>
            <Text style={[styles.countValue, { color: toneColor(item.tone) }]}>
              {counts[item.tone]}
            </Text>
            <Text style={styles.countLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {actionable.length > 0 ? (
        <View style={styles.actionList}>
          {actionable.slice(0, 3).map((metric) => (
            <View key={metric.key} style={styles.actionRow}>
              <View
                style={[
                  styles.actionDot,
                  { backgroundColor: toneColor(metric.status!.tone) },
                ]}
              />
              <Text style={styles.actionTitle} numberOfLines={1}>
                {metric.title}
              </Text>
              <Text
                style={[styles.actionStatus, { color: toneColor(metric.status!.tone) }]}
                numberOfLines={1}>
                {metric.status!.label}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    color: WyreColors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  period: {
    fontSize: 16,
    fontWeight: '700',
    color: WyreColors.textPrimary,
  },
  overallPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    maxWidth: '48%',
  },
  overallText: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '700',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  counts: {
    flexDirection: 'row',
    gap: 8,
  },
  countItem: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FAFAFC',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WyreColors.border,
  },
  countValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  countLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: WyreColors.textSecondary,
  },
  actionList: {
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: WyreColors.border,
    paddingTop: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: WyreColors.textPrimary,
  },
  actionStatus: {
    fontSize: 12,
    fontWeight: '600',
    maxWidth: '42%',
    textAlign: 'right',
  },
});
