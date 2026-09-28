import * as Notifications from 'expo-notifications';

import { saveNotificationToInbox } from '@/lib/notification-inbox';
import { handleNotificationOpen } from '@/lib/notification-routing';
import { parseNotificationId } from '@/lib/notifications-api';

type Unsubscribe = () => void;

let attached = false;
const unsubscribers: Unsubscribe[] = [];

export function configureNotificationPresentation(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

function contentFromNotification(
  notification: Notifications.Notification,
): { title: string; body: string; data: Record<string, unknown> } {
  const { title, body, data } = notification.request.content;
  return {
    title: title ?? 'Wyre alert',
    body: body ?? '',
    data: (data ?? {}) as Record<string, unknown>,
  };
}

/**
 * Saves delivered local notifications (iOS tests) to the inbox.
 * Server-backed FCM messages refresh from the API instead of being stored locally.
 */
export function attachExpoNotificationInboxListeners(): Unsubscribe {
  if (attached) {
    return () => undefined;
  }

  attached = true;

  const receivedSub = Notifications.addNotificationReceivedListener(async (notification) => {
    const { title, body, data } = contentFromNotification(notification);
    if (data.__inboxSaved === '1') return;
    await saveNotificationToInbox({ title, body, data });
  });
  unsubscribers.push(() => receivedSub.remove());

  const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
    const { title, body, data } = contentFromNotification(response.notification);
    const serverId = parseNotificationId(data.notification_id);
    if (serverId == null) {
      saveNotificationToInbox({ title, body, data }).catch(() => undefined);
    }
    handleNotificationOpen(data);
  });
  unsubscribers.push(() => responseSub.remove());

  return () => {
    unsubscribers.splice(0).forEach((unsub) => {
      try {
        unsub();
      } catch {
        // ignore
      }
    });
    attached = false;
  };
}
