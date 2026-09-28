import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/context/theme-context';
import { formatKwh } from '@/lib/report/helpers';

type BarItem = {
  label: string;
  value: number;
  color: string;
};

type HorizontalBarChartProps = {
  items: BarItem[];
};

export function HorizontalBarChart({ items }: HorizontalBarChartProps) {
  const { colors } = useAppTheme();
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <View style={styles.wrap}>
      {items.map((item) => {
        const widthPct = Math.max((item.value / max) * 100, item.value > 0 ? 4 : 0);
        return (
          <View key={item.label} style={styles.row}>
            <Text style={[styles.label, { color: colors.textOnCard }]} numberOfLines={1}>
              {item.label}
            </Text>
            <View style={[styles.track, { backgroundColor: colors.surfaceMuted }]}>
              <View
                style={[
                  styles.bar,
                  {
                    width: `${widthPct}%`,
                    backgroundColor: item.color,
                  },
                ]}
              />
            </View>
            <Text style={[styles.value, { color: colors.textOnCardSecondary }]}>
              {formatKwh(item.value)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    width: 92,
    fontSize: 12,
    fontWeight: '600',
  },
  track: {
    flex: 1,
    height: 18,
    borderRadius: 999,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 999,
  },
  value: {
    width: 64,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '600',
  },
});
