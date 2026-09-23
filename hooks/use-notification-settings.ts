import { useCallback, useEffect, useState } from 'react';

import {
  addBatteryScheduleTime,
  addBatterySocThreshold,
  addEnergyUsageThreshold,
  deleteBatteryScheduleTime,
  deleteBatterySocThreshold,
  deleteEnergyUsageThreshold,
  fetchBatteryNotificationConfig,
  fetchCapacityThreshold,
  fetchDieselReminderConfig,
  fetchEnergyUsageConfig,
  notificationSettingsError,
  updateBatteryNotificationConfig,
  updateCapacityThreshold,
  updateDieselReminderConfig,
  updateEnergyUsageConfig,
  type BatteryNotificationConfig,
  type BatterySocThreshold,
  type BatteryThresholdOperator,
  type CapacityThresholdConfig,
  type DieselReminderConfig,
  type EnergyUsageNotificationConfig,
  type EnergyUsageThreshold,
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
  const [energyConfig, setEnergyConfig] = useState<EnergyUsageNotificationConfig | null>(null);
  const [dieselConfig, setDieselConfig] = useState<DieselReminderConfig | null>(null);
  const [capacityConfig, setCapacityConfig] = useState<CapacityThresholdConfig | null>(null);
  const [batteryAvailability, setBatteryAvailability] =
    useState<SettingsAvailability>('unknown');
  const [energyAvailability, setEnergyAvailability] =
    useState<SettingsAvailability>('unknown');
  const [dieselAvailability, setDieselAvailability] =
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

      const [batteryResult, energyResult, dieselResult, capacityResult] = await Promise.allSettled([
        fetchBatteryNotificationConfig(branchId),
        fetchEnergyUsageConfig(branchId),
        fetchDieselReminderConfig(branchId),
        fetchCapacityThreshold(branchId),
      ]);

      const applySettled = <T,>(
        result: PromiseSettledResult<T>,
        setValue: (value: T | null) => void,
        setAvailability: (value: SettingsAvailability) => void,
      ) => {
        if (result.status === 'fulfilled') {
          setValue(result.value);
          setAvailability('available');
          return;
        }
        setValue(null);
        setAvailability(availabilityFromError(result.reason));
        const parsed = notificationSettingsError(result.reason);
        if (parsed.status !== 400 && parsed.status !== 403) setError(parsed.message);
      };

      applySettled(batteryResult, setBatteryConfig, setBatteryAvailability);
      applySettled(energyResult, setEnergyConfig, setEnergyAvailability);
      applySettled(dieselResult, setDieselConfig, setDieselAvailability);
      applySettled(capacityResult, setCapacityConfig, setCapacityAvailability);

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

  const updateEnergy = useCallback(
    async (
      patch: Partial<
        Pick<
          EnergyUsageNotificationConfig,
          'is_enabled' | 'push_enabled' | 'email_enabled' | 'target_kwh'
        >
      >,
    ) => {
      if (!branchId) return false;
      return mutate(
        'energy-config',
        () => updateEnergyUsageConfig(branchId, patch),
        setEnergyConfig,
      );
    },
    [branchId, mutate],
  );

  const addEnergyThreshold = useCallback(
    async (value: number) => {
      if (!branchId) return false;
      return mutate(
        'add-energy-threshold',
        () => addEnergyUsageThreshold(branchId, { operator: 'gte', value }),
        (created: EnergyUsageThreshold) =>
          setEnergyConfig((current) =>
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

  const removeEnergyThreshold = useCallback(
    async (thresholdId: number) => {
      if (!branchId) return false;
      return mutate(
        `energy-threshold-${thresholdId}`,
        async () => {
          await deleteEnergyUsageThreshold(branchId, thresholdId);
          return thresholdId;
        },
        (deletedId: number) =>
          setEnergyConfig((current) =>
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

  const updateDiesel = useCallback(
    async (
      patch: Partial<Pick<DieselReminderConfig, 'is_enabled' | 'push_enabled' | 'email_enabled'>>,
    ) => {
      if (!branchId) return false;
      return mutate(
        'diesel-config',
        () => updateDieselReminderConfig(branchId, patch),
        setDieselConfig,
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
    energyConfig,
    dieselConfig,
    capacityConfig,
    batteryAvailability,
    energyAvailability,
    dieselAvailability,
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
    updateEnergy,
    addEnergyThreshold,
    removeEnergyThreshold,
    updateDiesel,
    updateCapacity,
  };
}
