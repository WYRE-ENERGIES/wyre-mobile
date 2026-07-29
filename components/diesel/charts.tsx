import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { WyreColors } from '@/constants/theme';

export type LineSeries = {
  name: string;
  color: string;
  values: number[];
};

type MultiLineChartProps = {
  labels: string[];
  series: LineSeries[];
  yAxisLabel?: string;
  height?: number;
};

function buildLinePath(
  values: number[],
  width: number,
  height: number,
  padding: { top: number; right: number; bottom: number; left: number },
  maxY: number,
): string {
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const step = values.length > 1 ? innerW / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const x = padding.left + index * step;
      const y = padding.top + innerH - (maxY > 0 ? (value / maxY) * innerH : 0);
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

export function MultiLineChart({
  labels,
  series,
  yAxisLabel = 'kWh',
  height = 200,
}: MultiLineChartProps) {
  const width = 320;
  const padding = { top: 12, right: 12, bottom: 28, left: 36 };

  const maxY = useMemo(() => {
    const peak = Math.max(...series.flatMap((s) => s.values), 1);
    return peak * 1.15;
  }, [series]);

  const tickLabels = useMemo(() => {
    if (labels.length <= 5) return labels.map((label, index) => ({ label, index }));
    const step = Math.ceil(labels.length / 4);
    return labels
      .map((label, index) => ({ label, index }))
      .filter((item) => item.index % step === 0 || item.index === labels.length - 1);
  }, [labels]);

  if (series.length === 0 || labels.length === 0) {
    return <Text style={styles.empty}>No data available</Text>;
  }

  return (
    <View style={styles.chartWrap}>
      {yAxisLabel ? <Text style={styles.yLabel}>{yAxisLabel}</Text> : null}
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#E5E7EB"
          strokeWidth={1}
        />
        <Line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#E5E7EB"
          strokeWidth={1}
        />

        {series.map((item) => (
          <Path
            key={item.name}
            d={buildLinePath(item.values, width, height, padding, maxY)}
            stroke={item.color}
            strokeWidth={2}
            fill="none"
          />
        ))}

        {tickLabels.map(({ label, index }) => {
          const innerW = width - padding.left - padding.right;
          const step = labels.length > 1 ? innerW / (labels.length - 1) : 0;
          const x = padding.left + index * step;
          return (
            <SvgText
              key={`${label}-${index}`}
              x={x}
              y={height - 6}
              fontSize={9}
              fill={WyreColors.textSecondary}
              textAnchor="middle">
              {label}
            </SvgText>
          );
        })}
      </Svg>

      <View style={styles.legend}>
        {series.map((item) => (
          <View key={item.name} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={styles.legendText} numberOfLines={1}>
              {item.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export type BarGroup = {
  label: string;
  reported: number;
  predicted: number;
};

type GroupedBarChartProps = {
  groups: BarGroup[];
  reportedColor?: string;
  predictedColor?: string;
  height?: number;
};

export function GroupedBarChart({
  groups,
  reportedColor = '#5C12A7',
  predictedColor = '#FCCC43',
  height = 200,
}: GroupedBarChartProps) {
  const width = 320;
  const padding = { top: 12, right: 12, bottom: 28, left: 36 };

  const maxY = useMemo(() => {
    const peak = Math.max(...groups.flatMap((g) => [g.reported, g.predicted]), 1);
    return peak * 1.15;
  }, [groups]);

  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;
  const groupWidth = groups.length > 0 ? innerW / groups.length : innerW;
  const barWidth = Math.min(10, groupWidth * 0.28);

  const tickLabels = useMemo(() => {
    if (groups.length <= 5) return groups.map((group, index) => ({ label: group.label, index }));
    const step = Math.ceil(groups.length / 4);
    return groups
      .map((group, index) => ({ label: group.label, index }))
      .filter((item) => item.index % step === 0 || item.index === groups.length - 1);
  }, [groups]);

  if (groups.length === 0) {
    return <Text style={styles.empty}>No data available</Text>;
  }

  return (
    <View style={styles.chartWrap}>
      <Text style={styles.yLabel}>Fuel (L)</Text>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#E5E7EB"
          strokeWidth={1}
        />

        {groups.map((group, index) => {
          const centerX = padding.left + index * groupWidth + groupWidth / 2;
          const reportedH = maxY > 0 ? (group.reported / maxY) * innerH : 0;
          const predictedH = maxY > 0 ? (group.predicted / maxY) * innerH : 0;

          return (
            <React.Fragment key={`${group.label}-${index}`}>
              <Rect
                x={centerX - barWidth - 2}
                y={height - padding.bottom - reportedH}
                width={barWidth}
                height={reportedH}
                fill={reportedColor}
                rx={2}
              />
              <Rect
                x={centerX + 2}
                y={height - padding.bottom - predictedH}
                width={barWidth}
                height={predictedH}
                fill={predictedColor}
                rx={2}
              />
            </React.Fragment>
          );
        })}

        {tickLabels.map(({ label, index }) => {
          const x = padding.left + index * groupWidth + groupWidth / 2;
          return (
            <SvgText
              key={`${label}-${index}`}
              x={x}
              y={height - 6}
              fontSize={9}
              fill={WyreColors.textSecondary}
              textAnchor="middle">
              {label}
            </SvgText>
          );
        })}
      </Svg>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: reportedColor }]} />
          <Text style={styles.legendText}>Reported usage</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: predictedColor }]} />
          <Text style={styles.legendText}>EMS usage</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chartWrap: {
    gap: 8,
  },
  yLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: WyreColors.textSecondary,
  },
  empty: {
    fontSize: 13,
    color: WyreColors.textSecondary,
    textAlign: 'center',
    paddingVertical: 24,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: WyreColors.textPrimary,
    fontWeight: '500',
  },
});
