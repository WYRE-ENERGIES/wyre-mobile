import { Fragment } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, LinearGradient, Line, Polygon, Polyline, Rect, Stop } from 'react-native-svg';

import { useAppTheme } from '@/context/theme-context';
import type { SolarHourlyChart, SolarHourlyPoint, YieldTabKey } from '@/lib/solar-types';

type TodayEnergyChartProps = {
  data: SolarHourlyChart | null;
  source?: YieldTabKey;
  loading?: boolean;
};

const CHARGE_COLOR = '#22C55E';
const DISCHARGE_COLOR = '#F59E0B';
const LAGOS_TZ = 'Africa/Lagos';
const PLOT_WIDTH = 320;
const PLOT_HEIGHT = 140;
const PLOT_LEFT = 2;
const PLOT_RIGHT = 2;
const PLOT_TOP = 10;
const PLOT_BOTTOM = 12;

function lagosHour(date = new Date()): number {
  const hour = new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    hourCycle: 'h23',
    timeZone: LAGOS_TZ,
  }).format(date);
  const parsed = Number(hour);
  return Number.isFinite(parsed) ? parsed : date.getHours();
}

function parseClockHour(label: string, fallback: number): number {
  const trimmed = label.trim();
  if (!trimmed) return fallback;

  const iso = Date.parse(trimmed);
  if (!Number.isNaN(iso)) return lagosHour(new Date(iso));

  const match = trimmed.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (!match) return fallback;

  let hour = Number(match[1]);
  const suffix = match[3]?.toLowerCase();
  if (suffix === 'pm' && hour < 12) hour += 12;
  if (suffix === 'am' && hour === 12) hour = 0;
  return Math.max(0, Math.min(23, hour));
}

function seriesForSource(point: SolarHourlyPoint, source: YieldTabKey): number {
  if (source === 'generation') return point.pv_kw ?? 0;
  if (source === 'load') return point.load_kw ?? point.backup_load_kwh ?? 0;
  if (source === 'grid') return Math.abs(point.grid_kw ?? 0);
  return 0;
}

const AXIS_HOURS = [0, 6, 12, 18, 24];
const DAY_HOURS = 24;

function formatHourTick(hour: number): string {
  const clock = hour === 24 ? 0 : hour;
  if (clock === 0) return '12 AM';
  if (clock === 12) return '12 PM';
  if (clock < 12) return `${clock} AM`;
  return `${clock - 12} PM`;
}

function bucketByHour(hours: SolarHourlyPoint[], source: YieldTabKey) {
  const charge = Array.from({ length: DAY_HOURS }, () => 0);
  const discharge = Array.from({ length: DAY_HOURS }, () => 0);
  const energy = Array.from({ length: DAY_HOURS }, () => 0);

  hours.forEach((point, index) => {
    const hour = parseClockHour(point.hour_label, index);
    if (hour < 0 || hour >= DAY_HOURS) return;
    charge[hour] += point.battery_charge_kwh ?? 0;
    discharge[hour] += point.battery_discharge_kwh ?? 0;
    energy[hour] += seriesForSource(point, source);
  });

  return { charge, discharge, energy };
}

function linePoints(values: number[], max: number): string {
  const usableWidth = PLOT_WIDTH - PLOT_LEFT - PLOT_RIGHT;
  const usableHeight = PLOT_HEIGHT - PLOT_TOP - PLOT_BOTTOM;
  const last = Math.max(values.length - 1, 1);
  return values
    .map((value, index) => {
      const x = PLOT_LEFT + (index / last) * usableWidth;
      const y = PLOT_HEIGHT - PLOT_BOTTOM - (value / max) * usableHeight;
      return `${x},${y}`;
    })
    .join(' ');
}

export function TodayEnergyChart({
  data,
  source = 'generation',
  loading = false,
}: TodayEnergyChartProps) {
  const { colors } = useAppTheme();
  const nowHour = lagosHour();
  const isBattery = source === 'battery';
  const hours = data?.hours ?? [];
  const buckets = bucketByHour(hours, source);
  const slot = (PLOT_WIDTH - PLOT_LEFT - PLOT_RIGHT) / DAY_HOURS;
  const nowX = PLOT_LEFT + (nowHour + 0.5) * slot;
  const max = Math.max(
    ...(isBattery ? [...buckets.charge, ...buckets.discharge] : buckets.energy),
    1,
  );
  const hasActivity = isBattery
    ? buckets.charge.some((value) => value > 0) || buckets.discharge.some((value) => value > 0)
    : buckets.energy.some((value) => value > 0);
  const energyLine = linePoints(buckets.energy, max);
  const areaPoints = energyLine
    ? `${PLOT_LEFT},${PLOT_HEIGHT - PLOT_BOTTOM} ${energyLine} ${PLOT_WIDTH - PLOT_RIGHT},${PLOT_HEIGHT - PLOT_BOTTOM}`
    : '';
  const barWidth = Math.max(Math.min(slot * 0.38, 7), 2);
  const emptyMessage = loading ? 'Loading today’s pattern…' : 'No activity recorded today';

  return (
    <View style={styles.wrap}>
      {isBattery ? (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: CHARGE_COLOR }]} />
            <Text style={[styles.legendText, { color: colors.textOnCardSecondary }]}>Charged</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: DISCHARGE_COLOR }]} />
            <Text style={[styles.legendText, { color: colors.textOnCardSecondary }]}>
              Discharged
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.plot}>
        <Svg width="100%" height={PLOT_HEIGHT} viewBox={`0 0 ${PLOT_WIDTH} ${PLOT_HEIGHT}`}>
          <Defs>
            <LinearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={colors.accent} stopOpacity={0.3} />
              <Stop offset="1" stopColor={colors.accent} stopOpacity={0.02} />
            </LinearGradient>
          </Defs>
          {AXIS_HOURS.map((hour) => {
            const x = PLOT_LEFT + (hour / DAY_HOURS) * (PLOT_WIDTH - PLOT_LEFT - PLOT_RIGHT);
            return (
              <Line
                key={`tick-${hour}`}
                x1={x}
                x2={x}
                y1={PLOT_TOP}
                y2={PLOT_HEIGHT - PLOT_BOTTOM}
                stroke={colors.border}
                strokeWidth={1}
              />
            );
          })}
          {[0.25, 0.5, 0.75].map((position) => (
            <Line
              key={position}
              x1={PLOT_LEFT}
              x2={PLOT_WIDTH - PLOT_RIGHT}
              y1={PLOT_TOP + (PLOT_HEIGHT - PLOT_TOP - PLOT_BOTTOM) * position}
              y2={PLOT_TOP + (PLOT_HEIGHT - PLOT_TOP - PLOT_BOTTOM) * position}
              stroke={colors.border}
              strokeWidth={1}
            />
          ))}
          <Line
            x1={nowX}
            x2={nowX}
            y1={PLOT_TOP}
            y2={PLOT_HEIGHT - PLOT_BOTTOM}
            stroke={colors.textOnCardSecondary}
            strokeDasharray="4 4"
            strokeWidth={1}
            opacity={0.45}
          />

          {isBattery && hasActivity
            ? buckets.charge.map((charge, hour) => {
                const discharge = buckets.discharge[hour] ?? 0;
                if (charge <= 0 && discharge <= 0) return null;
                const x = PLOT_LEFT + hour * slot;
                const usableHeight = PLOT_HEIGHT - PLOT_TOP - PLOT_BOTTOM;
                const chargeHeight = (charge / max) * usableHeight;
                const dischargeHeight = (discharge / max) * usableHeight;
                return (
                  <Fragment key={hour}>
                    {charge > 0 ? (
                      <Rect
                        x={x + slot * 0.12}
                        y={PLOT_HEIGHT - PLOT_BOTTOM - chargeHeight}
                        width={barWidth}
                        height={chargeHeight}
                        rx={1.5}
                        fill={CHARGE_COLOR}
                      />
                    ) : null}
                    {discharge > 0 ? (
                      <Rect
                        x={x + slot * 0.12 + barWidth + 1}
                        y={PLOT_HEIGHT - PLOT_BOTTOM - dischargeHeight}
                        width={barWidth}
                        height={dischargeHeight}
                        rx={1.5}
                        fill={DISCHARGE_COLOR}
                      />
                    ) : null}
                  </Fragment>
                );
              })
            : null}

          {!isBattery && hasActivity ? (
            <>
              <Polygon points={areaPoints} fill="url(#chartFill)" />
              <Polyline
                points={energyLine}
                fill="none"
                stroke={colors.accent}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : null}
        </Svg>

        {!hasActivity ? (
          <View pointerEvents="none" style={styles.empty}>
            <Text style={[styles.emptyText, { color: colors.textOnCardSecondary }]}>
              {emptyMessage}
            </Text>
          </View>
        ) : null}
      </View>

      <View style={styles.axis}>
        {AXIS_HOURS.map((hour) => {
          const isFirst = hour === 0;
          const isLast = hour === 24;
          return (
            <Text
              key={hour}
              style={[
                styles.axisText,
                { color: colors.textOnCardSecondary },
                isFirst && styles.axisStart,
                isLast && styles.axisEnd,
                !isFirst &&
                  !isLast && [
                    styles.axisMid,
                    { left: `${(hour / DAY_HOURS) * 100}%` },
                  ],
              ]}>
              {formatHourTick(hour)}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 14,
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
    fontWeight: '600',
  },
  plot: {
    height: PLOT_HEIGHT,
    position: 'relative',
  },
  empty: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  axis: {
    height: 18,
    position: 'relative',
  },
  axisStart: {
    position: 'absolute',
    left: 0,
    textAlign: 'left',
  },
  axisMid: {
    position: 'absolute',
    width: 44,
    marginLeft: -22,
    textAlign: 'center',
  },
  axisEnd: {
    position: 'absolute',
    right: 0,
    textAlign: 'right',
  },
  axisText: {
    fontSize: 10,
    fontWeight: '600',
  },
});
