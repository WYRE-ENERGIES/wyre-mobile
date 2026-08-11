import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

type DonutSlice = {
  label: string;
  value: number;
  color: string;
};

type DonutChartProps = {
  slices: DonutSlice[];
  size?: number;
  strokeWidth?: number;
};

export function DonutChart({ slices, size = 200, strokeWidth = 42 }: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  const arcs = useMemo(() => {
    if (total <= 0) {
      return [
        {
          color: '#E5E7EB',
          dash: `${circumference} ${circumference}`,
          offset: 0,
          percent: 0,
        },
      ];
    }

    let offset = 0;
    return slices
      .filter((slice) => slice.value > 0)
      .map((slice) => {
        const percent = slice.value / total;
        const length = percent * circumference;
        const arc = {
          color: slice.color,
          dash: `${length} ${circumference - length}`,
          offset: -offset,
          percent: percent * 100,
        };
        offset += length;
        return arc;
      });
  }, [slices, total, circumference]);

  const centerLabels = arcs
    .filter((arc) => arc.percent >= 5)
    .slice(0, 2)
    .map((arc) => `${arc.percent.toFixed(1)}%`);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
          {arcs.map((arc, index) => (
            <Circle
              key={`${arc.color}-${index}`}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={arc.color}
              strokeWidth={strokeWidth}
              strokeDasharray={arc.dash}
              strokeDashoffset={arc.offset}
              fill="transparent"
              strokeLinecap="butt"
            />
          ))}
        </G>
      </Svg>
      <View style={styles.centerLabels} pointerEvents="none">
        {centerLabels.map((label) => (
          <Text key={label} style={styles.centerLabel}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerLabels: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  centerLabel: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '700',
  },
});
