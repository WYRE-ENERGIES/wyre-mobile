import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { WyreColors } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';
import type { ScorecardChartSegment } from '@/lib/scorecard-chart';

type ScorecardDoughnutChartProps = ScorecardChartSegment & {
  centerPrimary: string;
  centerSecondary?: string;
  accentColor?: string;
  size?: number;
};

export function ScorecardDoughnutChart({
  segments,
  centerPrimary,
  centerSecondary,
  accentColor = WyreColors.purple,
  size = 148,
}: ScorecardDoughnutChartProps) {
  const { colors } = useAppTheme();
  const strokeWidth = size <= 120 ? 16 : 20;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const total = segments.reduce((sum, segment) => sum + segment.value, 0) || 1;

  let offset = 0;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G rotation="-90" origin={`${size / 2}, ${size / 2}`}>
          {segments.map((segment, index) => {
            const length = (segment.value / total) * circumference;
            const circle = (
              <Circle
                key={index}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                stroke={segment.color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={`${length} ${circumference - length}`}
                strokeDashoffset={-offset}
              />
            );
            offset += length;
            return circle;
          })}
        </G>
      </Svg>

      <View style={styles.center} pointerEvents="none">
        <Text
          style={[
            styles.centerPrimary,
            { fontSize: size <= 120 ? 18 : 28, color: accentColor },
          ]}>
          {centerPrimary}
        </Text>
        {centerSecondary ? (
          <Text
            style={[
              styles.centerSecondary,
              { fontSize: size <= 120 ? 11 : 13, color: colors.textOnCardSecondary },
            ]}>
            {centerSecondary}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  centerPrimary: {
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  centerSecondary: {
    fontSize: 13,
  },
});
