import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { NotificationDetailView } from '@/components/alerts/notification-detail-view';
import { AccountScreen } from '@/components/wyre/account-screen';
import { ScreenCard } from '@/components/wyre/screen-card';
import { useAppTheme } from '@/context/theme-context';
import { notifyInboxChanged } from '@/lib/notification-inbox';
import { presentNotification } from '@/lib/notification-presentation';
import {
  fetchNotification,
  markNotificationRead,
  parseNotificationId,
  type ApiNotification,
} from '@/lib/notifications-api';

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const notificationId = parseNotificationId(id);
  const { colors } = useAppTheme();

  const [item, setItem] = useState<ApiNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const model = useMemo(() => (item ? presentNotification(item) : null), [item]);

  useEffect(() => {
    if (notificationId == null) {
      setError('This alert could not be found.');
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const notification = await fetchNotification(notificationId);
        if (!cancelled) setItem(notification);
        if (!notification.is_read) {
          await markNotificationRead(notificationId);
          notifyInboxChanged();
        }
      } catch {
        if (!cancelled) setError('Unable to load this alert. It may have been removed.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [notificationId]);

  return (
    <AccountScreen title={model?.typeLabel ?? 'Alert'} showWordmark={false} titleInHeader>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : error || !item || !model ? (
        <ScreenCard>
          <Text style={[styles.error, { color: colors.textOnCardSecondary }]}>
            {error || 'Alert not found.'}
          </Text>
          <Pressable onPress={() => router.replace('/alerts')} style={styles.link}>
            <Text style={[styles.linkText, { color: colors.accent }]}>Back to notifications</Text>
          </Pressable>
        </ScreenCard>
      ) : (
        <NotificationDetailView model={model} />
      )}
    </AccountScreen>
  );
}

const styles = StyleSheet.create({
  center: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  error: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  link: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
