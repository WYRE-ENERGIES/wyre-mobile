import { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import { ChartAxisLabel } from '@/components/charts/chart-axis-label';
import { useAppTheme } from '@/context/theme-context';
import {
  CHART_END_SPACING,
  CHART_INITIAL_SPACING,
  fitBars,
  thinLabels,
  Y_AXIS_LABEL_WIDTH,
} from '@/lib/chart-layout';
import type { BaselinePoint } from '@/lib/cost-tracker-types';
import { formatKwh } from '@/lib/format';

type CostTrackerBaselineChartProps = {
  points: BaselinePoint[];
};

const CHART_HEIGHT = 220;

function formatLabel(date: string): string {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;
  return parsed.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function CostTrackerBaselineChart({ points }: CostTrackerBaselineChartProps) {
  const { colors } = useAppTheme();
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.floor(event.nativeEvent.layout.width);
    if (nextWidth > 0 && nextWidth !== containerWidth) {
      setContainerWidth(nextWidth);
    }
  };

  const plotWidth = Math.max(containerWidth - Y_AXIS_LABEL_WIDTH, 0);

  const { barData, maxValue } = useMemo(() => {
    if (!points.length) {
      return { barData: [], maxValue: 10 };
    }

    const peak = Math.max(...points.flatMap((point) => [point.forecast, point.used]), 1);
    const labels = thinLabels(
      points.map((point) => formatLabel(point.date)),
      plotWidth,
    );
    const barData = points.map((point, index) => ({
      labelComponent: labels[index]
        ? () => <ChartAxisLabel text={labels[index]} />
        : undefined,
      stacks: [
        { value: point.used, color: colors.accent },
        { value: Math.max(point.forecast - point.used, 0), color: colors.surfaceMuted },
      ],
    }));

    return { barData, maxValue: Math.ceil(peak * 1.15) };
  }, [colors.accent, colors.surfaceMuted, plotWidth, points]);

  if (!points.length) {
    return (
      <View style={styles.empty}>
        <Text style={[styles.emptyText, { color: colors.textOnCardSecondary }]}>
          No baseline consumption data yet.
        </Text>
      </View>
    );
  }

  const latest = points[points.length - 1];
  const { barWidth, spacing } = fitBars(plotWidth, points.length);

  return (
    <View style={styles.container} onLayout={onLayout}>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
          <Text style={[styles.legendText, { color: colors.textOnCardSecondary }]}>Used</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.surfaceMuted }]} />
          <Text style={[styles.legendText, { color: colors.textOnCardSecondary }]}>
            Remaining forecast
          </Text>
        </View>
      </View>

      {plotWidth > 0 ? (
        <View style={styles.chartClip}>
          <BarChart
            stackData={barData}
            width={plotWidth}
            disableScroll
            yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
            height={CHART_HEIGHT}
            maxValue={maxValue}
            barWidth={barWidth}
            spacing={spacing}
            initialSpacing={CHART_INITIAL_SPACING}
            endSpacing={CHART_END_SPACING}
            xAxisThickness={0}
            yAxisThickness={0}
            hideRules
            noOfSections={4}
            yAxisTextStyle={[styles.axisText, { color: colors.textOnCardSecondary }]}
          />
        </View>
      ) : (
        <View style={{ height: CHART_HEIGHT }} />
      )}

      {latest ? (
        <Text style={[styles.caption, { color: colors.textOnCardSecondary }]}>
          Latest: {formatKwh(latest.used)} used of {formatKwh(latest.forecast)} forecast
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    width: '100%',
  },
  chartClip: {
    width: '100%',
    overflow: 'hidden',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
  },
  axisText: {
    fontSize: 10,
  },
  caption: {
    fontSize: 12,
  },
  empty: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
  },
});
