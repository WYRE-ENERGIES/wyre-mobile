import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Line, Polygon, Polyline, Stop } from 'react-native-svg';

import { useAppTheme } from '@/context/theme-context';
import type { SolarHourlyChart, SolarHourlyPoint, YieldTabKey } from '@/lib/solar-types';

type TodayEnergyChartProps = {
  data: SolarHourlyChart | null;
  source?: YieldTabKey;
};

function pointValue(point: SolarHourlyPoint, source: YieldTabKey): number {
  if (source === 'generation') return point.pv_kw ?? 0;
  if (source === 'load') return point.load_kw ?? point.backup_load_kwh ?? 0;
  if (source === 'grid') return Math.abs(point.grid_kw ?? 0);
  return (point.battery_charge_kwh ?? 0) + (point.battery_discharge_kwh ?? 0);
}

export function TodayEnergyChart({ data, source = 'generation' }: TodayEnergyChartProps) {
  const { colors } = useAppTheme();
  const width = 320;
  const height = 140;
  const hours = data?.hours ?? [];
  const values = hours.map((point) => pointValue(point, source));
  const max = Math.max(...values, 1);
  const points = values
    .map((value, index) => {
      const x = values.length <= 1 ? width / 2 : (index / (values.length - 1)) * (width - 16) + 8;
      const y = height - 12 - (value / max) * (height - 24);
      return `${x},${y}`;
    })
    .join(' ');
  const areaPoints = points ? `8,${height - 12} ${points} ${width - 8},${height - 12}` : '';
  const hasActivity = values.some((value) => value > 0);

  return (
    <View style={styles.wrap}>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <LinearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={colors.accent} stopOpacity={0.3} />
            <Stop offset="1" stopColor={colors.accent} stopOpacity={0.02} />
          </LinearGradient>
        </Defs>
        {[0.25, 0.5, 0.75].map((position) => (
          <Line
            key={position}
            x1={8}
            x2={width - 8}
            y1={height * position}
            y2={height * position}
            stroke={colors.border}
            strokeWidth={1}
          />
        ))}
        {areaPoints && hasActivity ? <Polygon points={areaPoints} fill="url(#chartFill)" /> : null}
        {points ? (
          <Polyline
            points={points}
            fill="none"
            stroke={colors.accent}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}
      </Svg>
      {!hasActivity ? (
        <View pointerEvents="none" style={styles.empty}>
          <Text style={[styles.emptyText, { color: colors.textOnCardSecondary }]}>
            No activity recorded today
          </Text>
        </View>
      ) : null}
      <View style={styles.axis}>
        <Text style={[styles.axisText, { color: colors.textOnCardSecondary }]}>12 AM</Text>
        <Text style={[styles.axisText, { color: colors.textOnCardSecondary }]}>12 PM</Text>
        <Text style={[styles.axisText, { color: colors.textOnCardSecondary }]}>Now</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 162,
    position: 'relative',
  },
  empty: {
    ...StyleSheet.absoluteFillObject,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  axis: {
    marginTop: -2,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  axisText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
