import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const TEST_DELAY_SECONDS = 2;

/**
 * iOS-only local notification test (works without Apple Developer push entitlement).
 * Schedules a banner after 2 seconds and saves to the in-app inbox when delivered.
 */
export async function scheduleIosTestNotification(): Promise<{ scheduled: boolean; permissionDenied?: boolean }> {
  if (Platform.OS !== 'ios') {
    return { scheduled: false };
  }

  const current = await Notifications.getPermissionsAsync();
  let status = current.status;
  if (status !== 'granted') {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }

  if (status !== 'granted') {
    return { scheduled: false, permissionDenied: true };
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Inverter 2 stopped exporting',
      body: 'PV production dropped to 0 kW on Lekki Solar Site. This is local test data, not a live Firebase push.',
      data: {
        source: 'ios_local_test',
        category: 'inverter',
        severity: 'warning',
        branch_name: 'Lekki Solar Site',
      },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: TEST_DELAY_SECONDS,
      repeats: false,
    },
  });

  return { scheduled: true };
}
