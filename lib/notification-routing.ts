import { router } from 'expo-router';

import { parseNotificationId } from '@/lib/notifications-api';
import { notifyInboxChanged } from '@/lib/notification-inbox';

/**
 * Snapshot of type → destination from the API guide.
 * Prefer `destination` on the notification object; this is the fallback.
 */
const TYPE_DESTINATION: Record<string, string | null> = {
  daily_energy_usage: 'EnergyStatusScreen',
  daily_solar_usage: 'SolarInsightScreen',
  daily_battery_soc: 'BatteryInsightScreen',
  over_usage_solar_power_demand: 'BatteryInsightScreen',
  over_usage_solar_capacity: 'SolarInsightScreen',
  test: null,
};

export type NotificationRoute =
  | '/(tabs)'
  | '/(tabs)/reports'
  | '/alerts';

export function destinationForType(type?: string | null): string | null {
  if (!type) return null;
  return TYPE_DESTINATION[type] ?? null;
}

export function resolveDestination(input: {
  destination?: string | null;
  type?: string | null;
}): string | null {
  if (input.destination) return input.destination;
  return destinationForType(input.type);
}

export function routeForDestination(destination?: string | null): NotificationRoute {
  switch (destination) {
    case 'SolarInsightScreen':
    case 'BatteryInsightScreen':
      return '/(tabs)';
    case 'EnergyStatusScreen':
      return '/(tabs)/reports';
    default:
      return '/alerts';
  }
}

export function labelForDestination(destination?: string | null): string | null {
  switch (destination) {
    case 'SolarInsightScreen':
      return 'Open solar dashboard';
    case 'BatteryInsightScreen':
      return 'Open battery insight';
    case 'EnergyStatusScreen':
      return 'Open energy status';
    default:
      return null;
  }
}

export function openNotificationById(id: number): void {
  notifyInboxChanged();
  router.push(`/notification/${id}`);
}

export function handleNotificationOpen(data?: Record<string, unknown>): void {
  const id = parseNotificationId(data?.notification_id);
  if (id != null) {
    openNotificationById(id);
    return;
  }
  router.push('/alerts');
}
