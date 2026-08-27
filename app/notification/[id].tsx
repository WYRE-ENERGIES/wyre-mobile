import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AccountScreen } from '@/components/wyre/account-screen';
import { DetailField, DetailSection, ScreenCard } from '@/components/wyre/screen-card';
import { useAppTheme } from '@/context/theme-context';
import { formatAlertTime } from '@/lib/alerts';
import { notifyInboxChanged } from '@/lib/notification-inbox';
import {
  labelForDestination,
  resolveDestination,
  routeForDestination,
} from '@/lib/notification-routing';
import {
  fetchNotification,
  markNotificationRead,
  parseNotificationId,
  type ApiNotification,
} from '@/lib/notifications-api';

function payloadFields(payload: Record<string, unknown> | null): { label: string; value: string }[] {
  if (!payload) return [];
  return Object.entries(payload)
    .filter(([, value]) => value != null && value !== '')
    .map(([key, value]) => ({
      label: key.replace(/_/g, ' '),
      value: typeof value === 'string' ? value : JSON.stringify(value),
    }));
}

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const notificationId = parseNotificationId(id);
  const { colors } = useAppTheme();

  const [item, setItem] = useState<ApiNotification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const destination = resolveDestination({
    destination: item?.destination,
    type: item?.type,
  });
  const destinationLabel = labelForDestination(destination);
  const snapshot = payloadFields(item?.payload ?? null);

  return (
    <AccountScreen title="Alert" showWordmark={false} titleInHeader>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : error || !item ? (
        <ScreenCard>
          <Text style={[styles.error, { color: colors.textOnCardSecondary }]}>
            {error || 'Alert not found.'}
          </Text>
          <Pressable onPress={() => router.replace('/alerts')} style={styles.link}>
            <Text style={[styles.linkText, { color: colors.accent }]}>Back to alerts</Text>
          </Pressable>
        </ScreenCard>
      ) : (
        <>
          <ScreenCard>
            <Text style={[styles.kicker, { color: colors.textOnCardSecondary }]}>
              {item.branch_name || 'Wyre EMS'}
              {item.created_at ? `  ·  ${formatAlertTime(item.created_at)}` : ''}
            </Text>
            <Text style={[styles.title, { color: colors.textOnCard }]}>{item.title}</Text>
            <Text style={[styles.body, { color: colors.textOnCard }]}>{item.body}</Text>
          </ScreenCard>

          {snapshot.length > 0 ? (
            <ScreenCard>
              <DetailSection title="Snapshot at send time">
                {snapshot.map((field) => (
                  <DetailField key={field.label} label={field.label} value={field.value} />
                ))}
              </DetailSection>
            </ScreenCard>
          ) : null}

          {destinationLabel ? (
            <AuthButton
              title={destinationLabel}
              onPress={() => router.replace(routeForDestination(destination))}
            />
          ) : (
            <AuthButton title="Back to alerts" onPress={() => router.replace('/alerts')} />
          )}
        </>
      )}
    </AccountScreen>
  );
}

const styles = StyleSheet.create({
  center: {
    paddingVertical: 48,
    alignItems: 'center',
  },
  kicker: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  body: {
    fontSize: 16,
    lineHeight: 22,
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
