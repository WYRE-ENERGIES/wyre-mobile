/**
 * Custom entry — registers FCM background handler before the app mounts.
 */
import { Platform } from 'react-native';

import { persistRemoteMessage } from './lib/push-notifications';

if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getMessaging, setBackgroundMessageHandler } = require('@react-native-firebase/messaging');
    setBackgroundMessageHandler(getMessaging(), async (remoteMessage: {
      notification?: { title?: string; body?: string };
      data?: Record<string, unknown>;
    }) => {
      // The backend already persisted the Notification. Refresh happens on next foreground.
      await persistRemoteMessage({
        title: remoteMessage.notification?.title ?? 'Wyre alert',
        body: remoteMessage.notification?.body ?? '',
        data: remoteMessage.data,
      });
      if (__DEV__) {
        console.log('[FCM] Background message received', remoteMessage.data);
      }
    });
  } catch {
    // Native module unavailable until prebuild / native rebuild.
  }
}

import 'expo-router/entry';
