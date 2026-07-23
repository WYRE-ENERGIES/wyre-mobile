import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { WyreColors } from '@/constants/theme';
import {
  formatAlertTime,
  type AlertCategory,
  type AlertSeverity,
  type SolarAlert,
} from '@/lib/dummy-alerts';

type AlertRowProps = {
  alert: SolarAlert;
  onPress: (alert: SolarAlert) => void;
  isLast?: boolean;
};

const CATEGORY_ICONS: Record<AlertCategory, keyof typeof MaterialIcons.glyphMap> = {
  generation: 'bolt',
  inverter: 'power-off',
  battery: 'battery-alert',
  weather: 'cloud-queue',
  capacity: 'speed',
  maintenance: 'build',
};

const SEVERITY_COLOR: Record<AlertSeverity, string> = {
  critical: WyreColors.error,
  warning: WyreColors.warning,
  info: WyreColors.purple,
  success: WyreColors.success,
};

export function AlertRow({ alert, onPress, isLast = false }: AlertRowProps) {
  const iconColor = SEVERITY_COLOR[alert.severity];

  return (
    <Pressable
      onPress={() => onPress(alert)}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`${alert.title}. ${alert.body}`}>
      <View style={styles.iconWrap}>
        <MaterialIcons
          name={CATEGORY_ICONS[alert.category]}
          size={22}
          color={iconColor}
        />
      </View>

      <View style={[styles.content, !isLast && styles.contentBorder]}>
        <View style={styles.topRow}>
          <Text
            style={[styles.title, !alert.read && styles.titleUnread]}
            numberOfLines={1}>
            {alert.title}
          </Text>
          <Text style={styles.time}>{formatAlertTime(alert.createdAt)}</Text>
          {!alert.read ? <View style={styles.unreadDot} /> : <View style={styles.unreadSpacer} />}
        </View>

        <Text style={styles.subtitle} numberOfLines={2}>
          {alert.branchName}
          {'  ·  '}
          {alert.body}
        </Text>

        {alert.severity === 'critical' ? (
          <Text style={styles.critical}>Needs attention</Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#FFFFFF',
  },
  pressed: {
    backgroundColor: '#F7F7FA',
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
  contentBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8EE',
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
    color: WyreColors.textPrimary,
  },
  titleUnread: {
    fontWeight: '700',
  },
  time: {
    fontSize: 13,
    color: WyreColors.textSecondary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: WyreColors.purple,
  },
  unreadSpacer: {
    width: 8,
    height: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 19,
    color: WyreColors.textSecondary,
    paddingRight: 16,
  },
  critical: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: WyreColors.error,
  },
});
