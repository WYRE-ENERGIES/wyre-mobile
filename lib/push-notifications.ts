import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  clearStoredFcmToken,
  getNotificationsEnabled,
  getStoredFcmToken,
  setStoredFcmToken,
} from '@/config/storage';
import {
  fetchPushConfig,
  getPushPlatform,
  registerDeviceToken,
  unregisterDeviceToken,
} from '@/lib/push-api';
import { saveNotificationToInbox } from '@/lib/notification-inbox';

type MessagingApi = typeof import('@react-native-firebase/messaging');
type MessagingInstance = import('@react-native-firebase/messaging').Messaging;
type Unsubscribe = () => void;

const ANDROID_CHANNEL_ID = 'wyre-alerts';

let messagingApi: MessagingApi | null | undefined;
let messagingInstance: MessagingInstance | null = null;
let messagingUnavailable = false;
let listenersAttached = false;
const unsubscribers: Unsubscribe[] = [];

function getMessagingApi(): MessagingApi | null {
  if (messagingApi !== undefined) return messagingApi;
  if (Platform.OS === 'web') {
    messagingApi = null;
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    messagingApi = require('@react-native-firebase/messaging') as MessagingApi;
  } catch {
    messagingApi = null;
  }
  return messagingApi;
}

function getMessagingInstance(): MessagingInstance | null {
  if (messagingUnavailable) return null;
  const api = getMessagingApi();
  if (!api) return null;
  if (!messagingInstance) {
    try {
      messagingInstance = api.getMessaging();
    } catch (error) {
      messagingUnavailable = true;
      if (__DEV__) {
        console.warn('[FCM] getMessaging failed', error);
      }
      return null;
    }
  }
  return messagingInstance;
}

export function isPushNativeAvailable(): boolean {
  return getMessagingInstance() != null;
}

async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: 'Wyre Alerts',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#5C12A7',
  });
}

export async function requestPushPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;

  await ensureAndroidChannel();

  const api = getMessagingApi();
  const instance = getMessagingInstance();
  if (!api || !instance) {
    const current = await Notifications.getPermissionsAsync();
    let status = current.status;
    if (status !== 'granted') {
      const requested = await Notifications.requestPermissionsAsync();
      status = requested.status;
    }
    return status === 'granted';
  }

  const authStatus = await api.requestPermission(instance);
  return (
    authStatus === api.AuthorizationStatus.AUTHORIZED ||
    authStatus === api.AuthorizationStatus.PROVISIONAL
  );
}

export async function getFcmToken(): Promise<string | null> {
  const api = getMessagingApi();
  const instance = getMessagingInstance();
  if (!api || !instance) return null;

  try {
    await ensureAndroidChannel();

    if (Platform.OS === 'ios' && !api.isDeviceRegisteredForRemoteMessages(instance)) {
      await api.registerDeviceForRemoteMessages(instance);
    }

    const token = await api.getToken(instance);
    if (__DEV__ && token) {
      console.log(`\n========== FCM DEVICE TOKEN (${Platform.OS}) ==========\n${token}\n====================================================\n`);
    }
    return token || null;
  } catch (error) {
    if (__DEV__) {
      console.warn('[FCM] getToken failed', error);
    }
    return null;
  }
}

export async function registerCurrentDeviceForPush(options?: {
  force?: boolean;
}): Promise<{ registered: boolean; permissionDenied?: boolean; token?: string }> {
  const platform = getPushPlatform();
  if (!platform) {
    return { registered: false };
  }

  // Android: always register. iOS remote push waits for backend ios_push_ready.
  if (platform === 'ios') {
    const config = await fetchPushConfig();
    if (!config.ios_push_ready) {
      if (__DEV__) {
        console.log('[FCM] Skipping iOS remote registration — ios_push_ready is false');
      }
      return { registered: false };
    }
  }

  const preferenceOn = await getNotificationsEnabled();
  if (!preferenceOn && !options?.force) {
    return { registered: false };
  }

  const permitted = await requestPushPermission();
  if (!permitted) {
    return { registered: false, permissionDenied: true };
  }

  const token = await getFcmToken();
  if (!token) {
    if (__DEV__) {
      console.warn('[FCM] No token — use a development build, not Expo Go.');
    }
    return { registered: false };
  }

  const previous = await getStoredFcmToken();
  if (previous === token && !options?.force) {
    return { registered: true, token };
  }

  try {
    await registerDeviceToken({ token, platform });
    await setStoredFcmToken(token);
    return { registered: true, token };
  } catch (error) {
    if (__DEV__) {
      console.warn('[FCM] Backend register failed', error);
    }
    return { registered: false, token };
  }
}

export async function unregisterPushOnLogout(): Promise<void> {
  const platform = getPushPlatform();
  const token = await getStoredFcmToken();

  if (platform && token) {
    try {
      await unregisterDeviceToken({ token, platform });
    } catch {
      // best-effort
    }
  }

  const api = getMessagingApi();
  const instance = getMessagingInstance();
  if (api && instance) {
    try {
      await api.deleteToken(instance);
    } catch {
      // ignore
    }
  }

  await clearStoredFcmToken();
}

export async function disablePushAndUnregister(): Promise<void> {
  await unregisterPushOnLogout();
}

export async function persistRemoteMessage(input: {
  title?: string | null;
  body?: string | null;
  data?: Record<string, unknown>;
}): Promise<void> {
  await saveNotificationToInbox({
    title: input.title ?? 'Wyre alert',
    body: input.body ?? '',
    data: input.data,
  });
}

export function attachPushListeners(handlers?: {
  onNotificationOpened?: (data: Record<string, string> | undefined) => void;
}): Unsubscribe {
  if (listenersAttached) {
    return () => undefined;
  }

  const api = getMessagingApi();
  const instance = getMessagingInstance();
  if (!api || !instance) {
    return () => undefined;
  }

  listenersAttached = true;

  unsubscribers.push(
    api.onTokenRefresh(instance, async (token) => {
      const platform = getPushPlatform();
      if (!platform) return;

      if (platform === 'ios') {
        const config = await fetchPushConfig();
        if (!config.ios_push_ready) return;
      }

      const preferenceOn = await getNotificationsEnabled();
      if (!preferenceOn) return;
      try {
        await registerDeviceToken({ token, platform });
        await setStoredFcmToken(token);
      } catch (error) {
        if (__DEV__) {
          console.warn('[FCM] Token refresh register failed', error);
        }
      }
    }),
  );

  unsubscribers.push(
    api.onMessage(instance, async (remoteMessage) => {
      const title = remoteMessage.notification?.title ?? 'Wyre';
      const body = remoteMessage.notification?.body ?? '';
      const data = (remoteMessage.data ?? {}) as Record<string, unknown>;

      await persistRemoteMessage({ title, body, data });

      try {
        await Notifications.scheduleNotificationAsync({
          content: {
            title,
            body,
            data: { ...data, __inboxSaved: '1' },
            sound: true,
          },
          trigger: null,
        });
      } catch (error) {
        if (__DEV__) {
          console.warn('[FCM] Foreground display failed', error);
        }
      }
    }),
  );

  unsubscribers.push(
    api.onNotificationOpenedApp(instance, (remoteMessage) => {
      handlers?.onNotificationOpened?.(
        remoteMessage.data as Record<string, string> | undefined,
      );
    }),
  );

  api
    .getInitialNotification(instance)
    .then((remoteMessage) => {
      if (remoteMessage) {
        handlers?.onNotificationOpened?.(
          remoteMessage.data as Record<string, string> | undefined,
        );
      }
    })
    .catch(() => undefined);

  return () => {
    unsubscribers.splice(0).forEach((unsub) => {
      try {
        unsub();
      } catch {
        // ignore
      }
    });
    listenersAttached = false;
  };
}
