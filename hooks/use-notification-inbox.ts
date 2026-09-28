import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';

import type { WyreAlert } from '@/lib/alerts';
import {
  loadNotificationInbox,
  markAlertRead,
  markAllAlertsRead,
  subscribeNotificationInbox,
} from '@/lib/notification-inbox';

export function useNotificationInbox() {
  const [alerts, setAlerts] = useState<WyreAlert[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async (mode: 'initial' | 'silent' | 'pull' = 'silent') => {
    if (mode === 'pull') setRefreshing(true);
    try {
      const inbox = await loadNotificationInbox();
      setAlerts(inbox.alerts);
      setUnreadCount(inbox.unreadCount);
    } catch {
      // keep the last successful snapshot
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    refresh('initial').catch(() => setLoading(false));
    return subscribeNotificationInbox(() => {
      refresh('silent').catch(() => undefined);
    });
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh('silent').catch(() => undefined);
    }, [refresh]),
  );

  const onMarkRead = useCallback(async (alertId: string) => {
    setAlerts((current) =>
      current.map((item) => (item.id === alertId ? { ...item, read: true } : item)),
    );
    setUnreadCount((count) => Math.max(0, count - 1));
    await markAlertRead(alertId);
    await refresh('silent');
  }, [refresh]);

  const onMarkAllRead = useCallback(async () => {
    setAlerts((current) => current.map((item) => ({ ...item, read: true })));
    setUnreadCount(0);
    await markAllAlertsRead();
    await refresh('silent');
  }, [refresh]);

  return {
    alerts,
    unreadCount,
    loading,
    refreshing,
    refresh: () => refresh('pull'),
    onMarkRead,
    onMarkAllRead,
  };
}

export function useUnreadNotificationCount(enabled = true) {
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      const inbox = await loadNotificationInbox();
      setUnreadCount(inbox.unreadCount);
    } catch {
      // keep last count
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setUnreadCount(0);
      return;
    }
    refresh().catch(() => undefined);
    return subscribeNotificationInbox(() => {
      refresh().catch(() => undefined);
    });
  }, [enabled, refresh]);

  return unreadCount;
}
