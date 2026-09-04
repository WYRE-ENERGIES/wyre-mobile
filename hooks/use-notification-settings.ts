import { useCallback, useEffect, useState } from 'react';

import {
  addBatteryScheduleTime,
  addBatterySocThreshold,
  deleteBatteryScheduleTime,
  deleteBatterySocThreshold,
  fetchBatteryNotificationConfig,
  fetchCapacityThreshold,
  notificationSettingsError,
  updateBatteryNotificationConfig,
  updateCapacityThreshold,
  type BatteryNotificationConfig,
  type BatterySocThreshold,
  type BatteryThresholdOperator,
  type CapacityThresholdConfig,
  type NotificationScheduleTime,
} from '@/lib/notification-settings-api';

export type SettingsAvailability = 'unknown' | 'available' | 'unavailable' | 'forbidden' | 'error';

function availabilityFromError(error: unknown): SettingsAvailability {
  const parsed = notificationSettingsError(error);
  if (parsed.status === 400) return 'unavailable';
  if (parsed.status === 403) return 'forbidden';
  return 'error';
}

export function useNotificationSettings(branchId: number | null) {
  const [batteryConfig, setBatteryConfig] = useState<BatteryNotificationConfig | null>(null);
  const [capacityConfig, setCapacityConfig] = useState<CapacityThresholdConfig | null>(null);
  const [batteryAvailability, setBatteryAvailability] =
    useState<SettingsAvailability>('unknown');
  const [capacityAvailability, setCapacityAvailability] =
    useState<SettingsAvailability>('unknown');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (pull = false) => {
      if (!branchId) {
        setLoading(false);
        return;
      }
      if (pull) setRefreshing(true);
      else setLoading(true);
      setError(null);

      const [batteryResult, capacityResult] = await Promise.allSettled([
        fetchBatteryNotificationConfig(branchId),
        fetchCapacityThreshold(branchId),
      ]);

      if (batteryResult.status === 'fulfilled') {
        setBatteryConfig(batteryResult.value);
        setBatteryAvailability('available');
      } else {
        setBatteryConfig(null);
        setBatteryAvailability(availabilityFromError(batteryResult.reason));
        const parsed = notificationSettingsError(batteryResult.reason);
        if (parsed.status !== 400 && parsed.status !== 403) setError(parsed.message);
      }

      if (capacityResult.status === 'fulfilled') {
        setCapacityConfig(capacityResult.value);
        setCapacityAvailability('available');
      } else {
        setCapacityConfig(null);
        setCapacityAvailability(availabilityFromError(capacityResult.reason));
        const parsed = notificationSettingsError(capacityResult.reason);
        if (parsed.status !== 400 && parsed.status !== 403) setError(parsed.message);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [branchId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const mutate = useCallback(
    async <T,>(key: string, operation: () => Promise<T>, apply: (value: T) => void) => {
      setBusy(key);
      setError(null);
      try {
        const value = await operation();
        apply(value);
        return true;
      } catch (caught) {
        setError(notificationSettingsError(caught).message);
        return false;
      } finally {
        setBusy(null);
      }
    },
    [],
  );

  const updateBattery = useCallback(
    async (
      patch: Partial<
        Pick<BatteryNotificationConfig, 'is_enabled' | 'push_enabled' | 'email_enabled'>
      >,
    ) => {
      if (!branchId) return false;
      return mutate(
        'battery-config',
        () => updateBatteryNotificationConfig(branchId, patch),
        setBatteryConfig,
      );
    },
    [branchId, mutate],
  );

  const addTime = useCallback(
    async (time: string, daysOfWeek: string) => {
      if (!branchId) return false;
      return mutate(
        'add-time',
        () => addBatteryScheduleTime(branchId, { time, days_of_week: daysOfWeek }),
        (created: NotificationScheduleTime) =>
          setBatteryConfig((current) =>
            current
              ? {
                  ...current,
                  schedule_times: [
                    ...current.schedule_times.filter((item) => item.id !== created.id),
                    created,
                  ].sort((a, b) => a.time.localeCompare(b.time)),
                }
              : current,
          ),
      );
    },
    [branchId, mutate],
  );

  const removeTime = useCallback(
    async (timeId: number) => {
      if (!branchId) return false;
      return mutate(
        `time-${timeId}`,
        async () => {
          await deleteBatteryScheduleTime(branchId, timeId);
          return timeId;
        },
        (deletedId: number) =>
          setBatteryConfig((current) =>
            current
              ? {
                  ...current,
                  schedule_times: current.schedule_times.filter(
                    (item) => item.id !== deletedId,
                  ),
                }
              : current,
          ),
      );
    },
    [branchId, mutate],
  );

  const addThreshold = useCallback(
    async (operator: BatteryThresholdOperator, value: number) => {
      if (!branchId) return false;
      return mutate(
        'add-threshold',
        () => addBatterySocThreshold(branchId, { operator, value }),
        (created: BatterySocThreshold) =>
          setBatteryConfig((current) =>
            current
              ? {
                  ...current,
                  thresholds: [
                    ...current.thresholds.filter((item) => item.id !== created.id),
                    created,
                  ].sort((a, b) => a.value - b.value),
                }
              : current,
          ),
      );
    },
    [branchId, mutate],
  );

  const removeThreshold = useCallback(
    async (thresholdId: number) => {
      if (!branchId) return false;
      return mutate(
        `threshold-${thresholdId}`,
        async () => {
          await deleteBatterySocThreshold(branchId, thresholdId);
          return thresholdId;
        },
        (deletedId: number) =>
          setBatteryConfig((current) =>
            current
              ? {
                  ...current,
                  thresholds: current.thresholds.filter(
                    (item) => item.id !== deletedId,
                  ),
                }
              : current,
          ),
      );
    },
    [branchId, mutate],
  );

  const updateCapacity = useCallback(
    async (
      patch: Partial<Pick<CapacityThresholdConfig, 'threshold_pct' | 'enabled'>>,
    ) => {
      if (!branchId) return false;
      return mutate(
        'capacity',
        () => updateCapacityThreshold(branchId, patch),
        setCapacityConfig,
      );
    },
    [branchId, mutate],
  );

  return {
    batteryConfig,
    capacityConfig,
    batteryAvailability,
    capacityAvailability,
    loading,
    refreshing,
    busy,
    error,
    refresh: () => load(true),
    updateBattery,
    addTime,
    removeTime,
    addThreshold,
    removeThreshold,
    updateCapacity,
  };
}
