import { useMemo, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

import { ChartAxisLabel } from '@/components/charts/chart-axis-label';
import { WyreColors } from '@/constants/theme';
import {
  CHART_END_SPACING,
  CHART_INITIAL_SPACING,
  fitBars,
  thinLabels,
  Y_AXIS_LABEL_WIDTH,
} from '@/lib/chart-layout';
import type { MonthlyCostPoint } from '@/lib/cost-tracker-transform';
import { formatNgn } from '@/lib/format';

type CostTrackerMonthlyChartProps = {
  points: MonthlyCostPoint[];
};

const CHART_HEIGHT = 220;

export function CostTrackerMonthlyChart({ points }: CostTrackerMonthlyChartProps) {
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.floor(event.nativeEvent.layout.width);
    if (nextWidth > 0 && nextWidth !== containerWidth) {
      setContainerWidth(nextWidth);
    }
  };

  const plotWidth = Math.max(containerWidth - Y_AXIS_LABEL_WIDTH, 0);

  const { stackData, maxValue } = useMemo(() => {
    if (!points.length) {
      return { stackData: [], maxValue: 10 };
    }

    const peak = Math.max(...points.map((point) => point.total), 1);
    const labels = thinLabels(
      points.map((point) => point.month),
      plotWidth,
    );
    const stackData = points.map((point, index) => ({
      labelComponent: labels[index]
        ? () => <ChartAxisLabel text={labels[index]} />
        : undefined,
      stacks: [
        { value: point.diesel, color: WyreColors.purple },
        { value: point.utility, color: WyreColors.orange },
      ],
    }));

    return { stackData, maxValue: Math.ceil(peak * 1.15) };
  }, [plotWidth, points]);

  if (!points.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No monthly cost data yet.</Text>
      </View>
    );
  }

  const { barWidth, spacing } = fitBars(plotWidth, points.length);

  return (
    <View style={styles.container} onLayout={onLayout}>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: WyreColors.purple }]} />
          <Text style={styles.legendText}>Diesel</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: WyreColors.orange }]} />
          <Text style={styles.legendText}>Utility</Text>
        </View>
      </View>

      {plotWidth > 0 ? (
        <View style={styles.chartClip}>
          <BarChart
            stackData={stackData}
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
            yAxisTextStyle={styles.axisText}
            formatYLabel={(value) => {
              const num = Number(value);
              if (Number.isNaN(num)) return value;
              if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
              if (num >= 1_000) return `${(num / 1_000).toFixed(0)}k`;
              return String(num);
            }}
          />
        </View>
      ) : (
        <View style={{ height: CHART_HEIGHT }} />
      )}

      <Text style={styles.caption}>
        Latest month total: {formatNgn(points[points.length - 1]?.total)}
      </Text>
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
    color: WyreColors.textSecondary,
  },
  axisText: {
    fontSize: 10,
    color: WyreColors.textSecondary,
  },
  caption: {
    fontSize: 12,
    color: WyreColors.textSecondary,
  },
  empty: {
    height: CHART_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: WyreColors.textSecondary,
  },
});
