import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { WyreColors } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';
import {
  formatAlertTime,
  type AlertCategory,
  type AlertSeverity,
  type WyreAlert,
} from '@/lib/alerts';

type AlertRowProps = {
  alert: WyreAlert;
  onPress: (alert: WyreAlert) => void;
  isLast?: boolean;
};

const CATEGORY_ICONS = {
  generation: 'bolt.fill',
  inverter: 'power',
  battery: 'battery.25',
  weather: 'cloud',
  capacity: 'gauge.with.dots.needle.33percent',
  maintenance: 'wrench.and.screwdriver.fill',
} as const satisfies Record<AlertCategory, string>;

const SEVERITY_COLOR: Record<AlertSeverity, string> = {
  critical: WyreColors.error,
  warning: WyreColors.warning,
  info: WyreColors.purple,
  success: WyreColors.success,
};

export function AlertRow({ alert, onPress, isLast = false }: AlertRowProps) {
  const iconColor = SEVERITY_COLOR[alert.severity];
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={() => onPress(alert)}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.surface },
        pressed && { backgroundColor: colors.surfaceMuted },
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${alert.title}. ${alert.body}`}>
      <View style={styles.iconWrap}>
        <IconSymbol
          name={CATEGORY_ICONS[alert.category]}
          size={22}
          color={iconColor}
        />
      </View>

      <View style={[styles.content, !isLast && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
        <View style={styles.topRow}>
          <Text
            style={[styles.title, { color: colors.textOnCard }, !alert.read && styles.titleUnread]}
            numberOfLines={1}>
            {alert.title}
          </Text>
          <Text style={[styles.time, { color: colors.textOnCardSecondary }]}>
            {formatAlertTime(alert.createdAt)}
          </Text>
          {!alert.read ? (
            <View style={[styles.unreadDot, { backgroundColor: colors.accent }]} />
          ) : (
            <View style={styles.unreadSpacer} />
          )}
        </View>

        <Text style={[styles.subtitle, { color: colors.textOnCardSecondary }]} numberOfLines={2}>
          {alert.branchName}
          {'  ·  '}
          {alert.body}
        </Text>

        {alert.severity === 'critical' ? (
          <Text style={[styles.critical, { color: colors.error }]}>Needs attention</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  iconWrap: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 16,
  },
  content: {
    flex: 1,
    paddingTop: 14,
    paddingBottom: 14,
    paddingRight: 14,
    gap: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  titleUnread: {
    fontWeight: '700',
  },
  time: {
    fontSize: 13,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  unreadSpacer: {
    width: 8,
    height: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 19,
    paddingRight: 16,
  },
  critical: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
  },
});
