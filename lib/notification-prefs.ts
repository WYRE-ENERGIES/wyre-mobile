import { Linking, Platform } from 'react-native';

import { getNotificationsEnabled, setNotificationsEnabled } from '@/config/storage';
import { disablePushAndUnregister, registerCurrentDeviceForPush } from '@/lib/push-notifications';

export async function loadNotificationPreference(): Promise<boolean> {
  return getNotificationsEnabled();
}

/**
 * Toggle notification preference.
 * Android registers FCM with the backend when enabled.
 * iOS remote push waits for ios_push_ready; local iOS tests use Settings.
 */
export async function updateNotificationPreference(enabled: boolean): Promise<{
  enabled: boolean;
  permissionDenied?: boolean;
}> {
  if (!enabled) {
    await setNotificationsEnabled(false);
    await disablePushAndUnregister();
    return { enabled: false };
  }

  if (Platform.OS === 'web') {
    await setNotificationsEnabled(true);
    return { enabled: true };
  }

  await setNotificationsEnabled(true);
  const result = await registerCurrentDeviceForPush({ force: true });
  if (result.permissionDenied) {
    await setNotificationsEnabled(false);
    return { enabled: false, permissionDenied: true };
  }

  return { enabled: true };
}

export function openSystemNotificationSettings() {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
    return;
  }
  Linking.openSettings();
}
