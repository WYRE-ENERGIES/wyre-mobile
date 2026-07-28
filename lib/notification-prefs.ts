import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

import { getNotificationsEnabled, setNotificationsEnabled } from '@/config/storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function loadNotificationPreference(): Promise<boolean> {
  return getNotificationsEnabled();
}

/**
 * Toggle local notification preference.
 * Enabling also requests OS permission; if denied, preference stays off.
 */
export async function updateNotificationPreference(enabled: boolean): Promise<{
  enabled: boolean;
  permissionDenied?: boolean;
}> {
  if (!enabled) {
    await setNotificationsEnabled(false);
    return { enabled: false };
  }

  if (Platform.OS === 'web') {
    await setNotificationsEnabled(true);
    return { enabled: true };
  }

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;

  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (status !== 'granted') {
    await setNotificationsEnabled(false);
    return { enabled: false, permissionDenied: true };
  }

  await setNotificationsEnabled(true);
  return { enabled: true };
}

export function openSystemNotificationSettings() {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
    return;
  }
  Linking.openSettings();
}
