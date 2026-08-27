import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Svg, { Circle, Defs, Stop, LinearGradient as SvgGradient } from 'react-native-svg';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/context/theme-context';
import { formatKw, formatKwp } from '@/lib/format';
import type { SiteNode } from '@/lib/solar-types';

type EnergyUsageRingProps = {
  usagePercent: number;
  installedKwp: number;
  productionKw: number;
  battery: SiteNode | null;
};

export function EnergyUsageRing({
  usagePercent,
  installedKwp,
  productionKw,
  battery,
}: EnergyUsageRingProps) {
  const { width } = useWindowDimensions();
  const { colors, isDark } = useAppTheme();
  const size = Math.min(width * 0.57, 268);
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, usagePercent));
  const filled = (clamped / 100) * circumference;
  const soc = battery?.percentage ?? 0;
  const centerSize = size * 0.74;
  const centerContent = (
    <>
      <Text style={styles.centerLabel}>Energy Usages</Text>
      <Text style={styles.centerValue}>{Math.round(clamped)}%</Text>
    </>
  );

  return (
    <View style={[styles.wrap, { minHeight: size + 58 }]}>
      <View style={[styles.side, styles.sideLeft, { top: size * 0.80 }]}>
        <Text style={[styles.sideValue, { color: colors.textOnPage }]}>{formatKwp(installedKwp)}</Text>
        <Text style={[styles.sideLabel, { color: colors.textOnPageMuted }]}>Solar Installed</Text>
      </View>

      <View style={[styles.ringColumn, { width: size, height: size + 58 }]}>
        <View style={[styles.ring, { width: size, height: size }]}>
          <Svg width={size} height={size}>
            <Defs>
              <SvgGradient id="energyRing" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#C865FF" />
                <Stop offset="100%" stopColor="#9700FF" />
              </SvgGradient>
              <SvgGradient id="energyTrack" x1="0%" y1="0%" x2="0%" y2="100%">
                <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.72 : 0.18} />
                <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={isDark ? 0.12 : 0.08} />
              </SvgGradient>
            </Defs>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={isDark ? 'url(#energyTrack)' : 'rgba(92,18,167,0.12)'}
              strokeWidth={stroke}
              fill="transparent"
            />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="url(#energyRing)"
              strokeWidth={stroke}
              fill="transparent"
              strokeDasharray={`${filled} ${circumference - filled}`}
              strokeLinecap="round"
              transform={`rotate(-90 ${size / 2} ${size / 2})`}
            />
          </Svg>
          <LinearGradient
            colors={['#7A2CFF', '#AE00FF']}
            style={[
              styles.centerFill,
              { width: centerSize, height: centerSize, borderRadius: centerSize / 2 },
            ]}>
            {centerContent}
          </LinearGradient>
        </View>
        <View style={[styles.batteryPill, { top: size - 50 }]}>
          {battery?.direction === 'IN' ? <IconSymbol name="bolt.fill" size={18} color={colors.success} /> : null}
          {battery?.direction === 'OUT' ? <IconSymbol name="bolt.fill" size={18} color={colors.error} /> : null}
          <Text style={[styles.batteryPercent, { color: '#111827' }]}>{Math.round(soc)}%</Text>
          <Text style={[styles.batteryLabel, { color: '#6B7280' }]}>Battery</Text>
        </View>
        {battery?.direction === 'IN' ? (
          <View
            style={[
              styles.chargingBadge,
              { top: size + 20 },
            ]}>
            <Text style={[styles.chargingText, { color: colors.success }]}>Charging</Text>
          </View>
        ) : battery?.direction === 'OUT' ? (
          <View
            style={[
              styles.chargingBadge,
              { top: size + 20 },
            ]}>
            <Text style={[styles.chargingText, { color: colors.error }]}>Discharging</Text>
          </View>
        ) : null}
      </View>

      <View style={[styles.side, styles.sideRight, { top: size * 0.80 }]}>
        <Text style={[styles.sideValue, { color: colors.textOnPage }]}>{formatKw(productionKw)}</Text>
        <Text style={[styles.sideLabel, { color: colors.textOnPageMuted }]}>PV Production</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    position: 'relative',
  },
  side: {
    position: 'absolute',
    width: 116,
    alignItems: 'center',
    gap: 4,
    zIndex: 3,
  },
  sideLeft: {
    left: 6,
  },
  sideRight: {
    right: 6,
  },
  sideValue: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  sideLabel: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  ringColumn: {
    alignItems: 'center',
  },
  ring: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerFill: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  centerLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 15,
    fontWeight: '500',
  },
  centerValue: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1,
  },
  batteryPill: {
    position: 'absolute',
    minWidth: 66,
    minHeight: 64,
    borderRadius: 32,
    paddingHorizontal: 10,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 4,
  },
  batteryPercent: {
    fontSize: 15,
    lineHeight: 16,
    fontWeight: '800',
  },
  batteryLabel: {
    fontSize: 10,
    lineHeight: 11,
    fontWeight: '600',
  },
  chargingBadge: {
    position: 'absolute',
    minHeight: 24,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chargingText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
