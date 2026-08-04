import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

type BatteryIndicatorProps = {
  percentage: number;
  size?: number;
  charging?: boolean;
};

const BATTERY_GREEN = '#16a34a';
const BATTERY_IDLE = '#9ca3af';

function batteryIconName(percentage: number, charging: boolean): keyof typeof MaterialCommunityIcons.glyphMap {
  if (charging) return 'battery-charging';

  if (percentage >= 90) return 'battery';
  if (percentage >= 70) return 'battery-80';
  if (percentage >= 50) return 'battery-60';
  if (percentage >= 30) return 'battery-40';
  if (percentage >= 10) return 'battery-20';
  return 'battery-10';
}

export function BatteryIndicator({
  percentage,
  size = 132,
  charging = false,
}: BatteryIndicatorProps) {
  const clamped = Math.min(Math.max(percentage, 0), 100);
  const displayPercent = Math.round(clamped);
  const iconSize = size * 0.58;
  const iconColor = charging || clamped > 0 ? BATTERY_GREEN : BATTERY_IDLE;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <MaterialCommunityIcons
        name={batteryIconName(clamped, charging)}
        size={iconSize}
        color={iconColor}
      />
      <Text style={styles.percent}>{displayPercent}%</Text>
      <Text style={styles.label}>SOC</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  percent: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  label: {
    fontSize: 10,
    color: '#6B7280',
  },
});
