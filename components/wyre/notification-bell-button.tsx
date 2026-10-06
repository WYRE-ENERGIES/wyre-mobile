import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/context/theme-context';
import { useUnreadNotificationCount } from '@/hooks/use-notification-inbox';

type NotificationBellButtonProps = {
  enabled?: boolean;
  softBackground?: boolean;
};

export function NotificationBellButton({
  enabled = true,
  softBackground = false,
}: NotificationBellButtonProps) {
  const { colors, isDark } = useAppTheme();
  const unreadCount = useUnreadNotificationCount(enabled);
  const badgeLabel = unreadCount > 99 ? '99+' : String(unreadCount);

  return (
    <Pressable
      onPress={() => router.push('/alerts')}
      style={({ pressed }) => [
        styles.button,
        softBackground && {
          backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(92,18,167,0.07)',
        },
        pressed && styles.pressed,
      ]}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={
        unreadCount > 0 ? `Open notifications, ${unreadCount} unread` : 'Open notifications'
      }>
      <IconSymbol name="bell" size={30} color={colors.textOnPage} />
      {unreadCount > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badgeLabel}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 0,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.65,
  },
});
