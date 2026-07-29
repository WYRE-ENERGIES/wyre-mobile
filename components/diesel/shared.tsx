import { ReactNode, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { WyreColors } from '@/constants/theme';
import { GEN_COLORS } from '@/lib/diesel/helpers';
import type { ChartFrequency } from '@/lib/diesel/types';

type DieselCardProps = {
  title?: string;
  right?: ReactNode;
  children: ReactNode;
  loading?: boolean;
};

export function DieselCard({ title, right, children, loading }: DieselCardProps) {
  return (
    <View style={styles.card}>
      {title ? (
        <View style={styles.header}>
          <Text style={styles.title}>{title}</Text>
          {right}
        </View>
      ) : null}
      {loading ? <Text style={styles.loading}>Loading…</Text> : children}
    </View>
  );
}

type FrequencyToggleProps = {
  value: ChartFrequency;
  onChange: (value: ChartFrequency) => void;
};

export function FrequencyToggle({ value, onChange }: FrequencyToggleProps) {
  return (
    <View style={styles.toggle}>
      {(['daily', 'monthly'] as ChartFrequency[]).map((option) => {
        const active = value === option;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={[styles.toggleBtn, active && styles.toggleBtnActive]}>
            <Text style={[styles.toggleText, active && styles.toggleTextActive]}>
              {option === 'daily' ? 'Daily' : 'Monthly'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

type DonutSlice = {
  label: string;
  value: number;
  color: string;
};

type DieselDonutProps = {
  slices: DonutSlice[];
  size?: number;
  strokeWidth?: number;
  centerTop?: string;
  centerBottom?: string;
};

export function DieselDonut({
  slices,
  size = 148,
  strokeWidth = 28,
  centerTop,
  centerBottom,
}: DieselDonutProps) {
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
        },
      ];
    }

    let offset = 0;
    return slices
      .filter((slice) => slice.value > 0)
      .map((slice) => {
        const length = (slice.value / total) * circumference;
        const arc = {
          color: slice.color,
          dash: `${length} ${circumference - length}`,
          offset: -offset,
        };
        offset += length;
        return arc;
      });
  }, [slices, total, circumference]);

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
            />
          ))}
        </G>
      </Svg>
      <View style={styles.donutCenter} pointerEvents="none">
        {centerTop ? <Text style={styles.donutCenterTop}>{centerTop}</Text> : null}
        {centerBottom ? <Text style={styles.donutCenterBottom}>{centerBottom}</Text> : null}
      </View>
    </View>
  );
}

export function LegendRow({
  items,
}: {
  items: { label: string; color: string; value?: string }[];
}) {
  return (
    <View style={styles.legendWrap}>
      {items.map((item) => (
        <View key={item.label} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: item.color }]} />
          <Text style={styles.legendText} numberOfLines={1}>
            {item.value ? `${item.label} · ${item.value}` : item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function colorForIndex(index: number): string {
  return GEN_COLORS[index % GEN_COLORS.length];
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 14,
    borderWidth: 1,
    borderColor: '#ECECF3',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: WyreColors.textPrimary,
  },
  loading: {
    fontSize: 13,
    color: WyreColors.textSecondary,
  },
  toggle: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F8',
    borderRadius: 999,
    padding: 3,
    gap: 2,
  },
  toggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  toggleBtnActive: {
    backgroundColor: WyreColors.purple,
  },
  toggleText: {
    fontSize: 12,
    fontWeight: '600',
    color: WyreColors.textSecondary,
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  donutCenter: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  donutCenterTop: {
    fontSize: 12,
    fontWeight: '700',
    color: WyreColors.textPrimary,
    textAlign: 'center',
  },
  donutCenterBottom: {
    fontSize: 12,
    fontWeight: '700',
    color: WyreColors.textPrimary,
    textAlign: 'center',
  },
  legendWrap: {
    width: '100%',
    alignSelf: 'center',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  legendText: {
    flexShrink: 1,
    fontSize: 12,
    color: WyreColors.textPrimary,
    fontWeight: '500',
  },
});
