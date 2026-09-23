import { router } from 'expo-router';

import { parseNotificationId, markNotificationRead } from '@/lib/notifications-api';
import { notifyInboxChanged } from '@/lib/notification-inbox';

/**
 * Snapshot of type → destination from the live catalog.
 * Prefer `destination` on the notification object; this is the fallback.
 */
const TYPE_DESTINATION: Record<string, string | null> = {
  daily_energy_usage: 'EnergyStatusScreen',
  energy_usage_target: 'EnergyStatusScreen',
  weekly_energy_usage: 'EnergyStatusScreen',
  daily_solar_usage: 'SolarInsightScreen',
  daily_unfavorable_weather: 'SolarInsightScreen',
  solar_soiling: 'SolarInsightScreen',
  over_usage_solar_capacity: 'SolarInsightScreen',
  daily_battery_soc: 'BatteryInsightScreen',
  over_usage_solar_power_demand: 'BatteryInsightScreen',
  diesel_entry_reminder: 'DieselEntryScreen',
  test: null,
};

export type NotificationRoute =
  | '/(tabs)'
  | '/(tabs)/reports'
  | '/(tabs)/branches'
  | '/diesel-entry'
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
    case 'DieselEntryScreen':
      return '/diesel-entry';
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
    case 'DieselEntryScreen':
      return 'Record diesel entry';
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
  const type = typeof data?.type === 'string' ? data.type : null;
  const destination = resolveDestination({
    destination: typeof data?.destination === 'string' ? data.destination : null,
    type,
  });
  const route = destination ? routeForDestination(destination) : null;
  const missedDate =
    data?.missed_date != null
      ? String(data.missed_date)
      : data?.payload && typeof data.payload === 'object'
        ? String((data.payload as Record<string, unknown>).missed_date ?? '')
        : '';

  if (id != null) {
    markNotificationRead(id)
      .then(() => notifyInboxChanged())
      .catch(() => undefined);
  }

  // OS / push taps skip the alert page and open the live destination screen.
  if (route && route !== '/alerts') {
    if (route === '/diesel-entry' && /^\d{4}-\d{2}-\d{2}$/.test(missedDate)) {
      router.replace({ pathname: '/diesel-entry', params: { missed_date: missedDate } });
      return;
    }
    router.replace(route);
    return;
  }

  if (id != null) {
    router.push(`/notification/${id}`);
    return;
  }

  router.push('/alerts');
}
