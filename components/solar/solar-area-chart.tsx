import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { ChartAxisLabel } from '@/components/charts/chart-axis-label';
import { WyreColors } from '@/constants/theme';
import {
  CHART_END_SPACING,
  CHART_INITIAL_SPACING,
  fitLineSpacing,
  thinLabels,
  Y_AXIS_LABEL_WIDTH,
} from '@/lib/chart-layout';

export type ChartSeries = {
  key: string;
  label: string;
  color: string;
  values: number[];
};

type SolarAreaChartProps = {
  labels: string[];
  series: ChartSeries[];
  loading?: boolean;
  emptyMessage?: string;
  filled?: boolean;
};

const CHART_HEIGHT = 250;

export function SolarAreaChart({
  labels,
  series,
  loading = false,
  emptyMessage = 'No chart data for this date.',
  filled = true,
}: SolarAreaChartProps) {
  const [containerWidth, setContainerWidth] = useState(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const nextWidth = Math.floor(event.nativeEvent.layout.width);
    if (nextWidth > 0 && nextWidth !== containerWidth) {
      setContainerWidth(nextWidth);
    }
  };

  const plotWidth = Math.max(containerWidth - Y_AXIS_LABEL_WIDTH, 0);

  const { data, data2, data3, maxValue, hasData, spacing } = useMemo(() => {
    const visible = series.filter((s) => s.values.length > 0);
    const primaryValues = visible[0]?.values ?? [];

    if (primaryValues.length === 0 || labels.length === 0) {
      return {
        data: [],
        data2: undefined,
        data3: undefined,
        maxValue: 10,
        hasData: false,
        spacing: 1,
      };
    }

    const allValues = visible.flatMap((s) => s.values);
    const peak = Math.max(...allValues, 1);
    const axisLabels = thinLabels(labels, plotWidth);

    const toPoints = (values: number[], withLabels: boolean) =>
      values.map((value, index) => ({
        value,
        labelComponent:
          withLabels && axisLabels[index]
            ? () => <ChartAxisLabel text={axisLabels[index]} />
            : undefined,
      }));

    return {
      data: toPoints(primaryValues, true),
      data2: visible[1] ? toPoints(visible[1].values, false) : undefined,
      data3: visible[2] ? toPoints(visible[2].values, false) : undefined,
      maxValue: Math.ceil(peak * 1.1),
      hasData: true,
      spacing: fitLineSpacing(plotWidth, primaryValues.length),
    };
  }, [labels, plotWidth, series]);

  if (loading) {
    return (
      <View style={[styles.centered, { height: CHART_HEIGHT }]}>
        <ActivityIndicator size="small" color={WyreColors.purple} />
      </View>
    );
  }

  if (!hasData) {
    return (
      <View style={[styles.centered, { height: CHART_HEIGHT }]}>
        <Text style={styles.emptyText}>{emptyMessage}</Text>
      </View>
    );
  }

  const visibleSeries = series.filter((s) => s.values.length > 0);

  return (
    <View style={styles.container} onLayout={onLayout}>
      {plotWidth > 0 ? (
        <View style={styles.chartClip}>
          <LineChart
            areaChart={filled}
            curved
            data={data}
            data2={data2}
            data3={data3}
            height={CHART_HEIGHT}
            width={plotWidth}
            disableScroll
            yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
            maxValue={maxValue}
            noOfSections={4}
            spacing={spacing}
            initialSpacing={CHART_INITIAL_SPACING}
            endSpacing={CHART_END_SPACING}
            hideDataPoints
            isAnimated={false}
            color1={visibleSeries[0]?.color}
            color2={visibleSeries[1]?.color}
            color3={visibleSeries[2]?.color}
            startFillColor1={visibleSeries[0]?.color}
            startFillColor2={visibleSeries[1]?.color}
            startFillColor3={visibleSeries[2]?.color}
            endFillColor1={visibleSeries[0]?.color}
            endFillColor2={visibleSeries[1]?.color}
            endFillColor3={visibleSeries[2]?.color}
            startOpacity={filled ? 0.45 : 0}
            endOpacity={filled ? 0.08 : 0}
            startOpacity2={filled ? 0.45 : 0}
            endOpacity2={filled ? 0.08 : 0}
            startOpacity3={filled ? 0.45 : 0}
            endOpacity3={filled ? 0.08 : 0}
            thickness={2}
            yAxisTextStyle={styles.axisText}
            rulesColor={WyreColors.border}
            rulesType="dashed"
            xAxisThickness={0}
            yAxisThickness={0}
            labelsExtraHeight={8}
            overflowTop={8}
          />
        </View>
      ) : (
        <View style={{ height: CHART_HEIGHT }} />
      )}

      <View style={styles.legend}>
        {series.map((item) => (
          <View key={item.key} style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    width: '100%',
  },
  chartClip: {
    width: '100%',
    overflow: 'hidden',
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: WyreColors.textSecondary,
    textAlign: 'center',
  },
  axisText: {
    fontSize: 10,
    color: WyreColors.textSecondary,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
    color: WyreColors.textSecondary,
  },
});
