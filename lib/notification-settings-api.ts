import { isAxiosError, type AxiosResponse } from 'axios';

import { APIService } from '@/config/api/apiServices';

export type NotificationScheduleTime = {
  id: number;
  time: string;
  days_of_week: string;
  last_sent_on: string | null;
};

export type BatteryThresholdOperator = 'lte' | 'gte';

export type BatterySocThreshold = {
  id: number;
  metric: 'battery_soc';
  operator: BatteryThresholdOperator;
  value: number;
};

export type BatteryNotificationConfig = {
  id: number;
  branch_id: number;
  branch_name: string;
  notification_type: 'daily_battery_soc';
  category?: string;
  is_enabled: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  schedule_times: NotificationScheduleTime[];
  thresholds: BatterySocThreshold[];
  updated_at: string;
};

export type EnergyUsageThreshold = {
  id: number;
  metric: 'energy_usage_pct';
  operator: 'gte';
  value: number;
  locked?: boolean;
};

export type EnergyUsageNotificationConfig = {
  id: number;
  branch_id: number;
  branch_name: string;
  notification_type: 'energy_usage_target';
  category?: string;
  is_enabled: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  schedule_times: NotificationScheduleTime[];
  thresholds: EnergyUsageThreshold[];
  updated_at: string;
  target_kwh: number;
};

export type DieselReminderConfig = {
  id: number;
  branch_id: number;
  branch_name: string;
  notification_type: 'diesel_entry_reminder';
  category?: string;
  is_enabled: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  schedule_times: NotificationScheduleTime[];
  thresholds: unknown[];
  updated_at: string;
  reminder_time: string;
};

export type CapacityThresholdConfig = {
  branch_id: number;
  branch_name?: string;
  threshold_pct: number;
  enabled: boolean;
  category?: string;
};

export type NotificationSettingsError = {
  status: number | null;
  message: string;
};

type BatteryConfigPatch = Partial<
  Pick<BatteryNotificationConfig, 'is_enabled' | 'push_enabled' | 'email_enabled'>
>;

type EnergyConfigPatch = Partial<
  Pick<
    EnergyUsageNotificationConfig,
    'is_enabled' | 'push_enabled' | 'email_enabled' | 'target_kwh'
  >
>;

type DieselConfigPatch = Partial<
  Pick<DieselReminderConfig, 'is_enabled' | 'push_enabled' | 'email_enabled'>
>;

type CapacityPatch = Partial<Pick<CapacityThresholdConfig, 'threshold_pct' | 'enabled'>>;

function unwrapData<T>(response: AxiosResponse): T {
  const body = response.data;
  if (body?.data !== undefined) return body.data as T;
  return body as T;
}

function configPath(branchId: number, type: string) {
  return `branches/${branchId}/notification-configs/${type}`;
}

export function notificationSettingsError(error: unknown): NotificationSettingsError {
  if (!isAxiosError(error)) {
    return {
      status: null,
      message: error instanceof Error ? error.message : 'Something went wrong. Please try again.',
    };
  }

  const status = error.response?.status ?? null;
  const body = error.response?.data;
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    if (typeof record.detail === 'string') return { status, message: record.detail };

    for (const value of Object.values(record)) {
      if (Array.isArray(value) && typeof value[0] === 'string') {
        return { status, message: value[0] };
      }
      if (typeof value === 'string') return { status, message: value };
    }
  }

  return {
    status,
    message:
      status === 404
        ? 'The notification settings API is not available on this server yet.'
        : status === 403
        ? 'You are not permitted to change alert settings.'
        : 'Unable to update alert settings. Please try again.',
  };
}

export async function fetchBatteryNotificationConfig(
  branchId: number,
): Promise<BatteryNotificationConfig> {
  const response = await APIService.get(`${configPath(branchId, 'daily_battery_soc')}/`);
  return unwrapData<BatteryNotificationConfig>(response);
}

export async function updateBatteryNotificationConfig(
  branchId: number,
  patch: BatteryConfigPatch,
): Promise<BatteryNotificationConfig> {
  const response = await APIService.put(`${configPath(branchId, 'daily_battery_soc')}/`, patch);
  return unwrapData<BatteryNotificationConfig>(response);
}

export async function addBatteryScheduleTime(
  branchId: number,
  input: { time: string; days_of_week: string },
): Promise<NotificationScheduleTime> {
  const response = await APIService.post(`${configPath(branchId, 'daily_battery_soc')}/times/`, input);
  return unwrapData<NotificationScheduleTime>(response);
}

export async function deleteBatteryScheduleTime(
  branchId: number,
  timeId: number,
): Promise<void> {
  await APIService.delete(`${configPath(branchId, 'daily_battery_soc')}/times/${timeId}/`);
}

export async function addBatterySocThreshold(
  branchId: number,
  input: { operator: BatteryThresholdOperator; value: number },
): Promise<BatterySocThreshold> {
  const response = await APIService.post(
    `${configPath(branchId, 'daily_battery_soc')}/thresholds/`,
    input,
  );
  return unwrapData<BatterySocThreshold>(response);
}

export async function deleteBatterySocThreshold(
  branchId: number,
  thresholdId: number,
): Promise<void> {
  await APIService.delete(
    `${configPath(branchId, 'daily_battery_soc')}/thresholds/${thresholdId}/`,
  );
}

export async function fetchEnergyUsageConfig(
  branchId: number,
): Promise<EnergyUsageNotificationConfig> {
  const response = await APIService.get(`${configPath(branchId, 'energy_usage_target')}/`);
  return unwrapData<EnergyUsageNotificationConfig>(response);
}

export async function updateEnergyUsageConfig(
  branchId: number,
  patch: EnergyConfigPatch,
): Promise<EnergyUsageNotificationConfig> {
  const response = await APIService.put(`${configPath(branchId, 'energy_usage_target')}/`, patch);
  return unwrapData<EnergyUsageNotificationConfig>(response);
}

export async function addEnergyUsageThreshold(
  branchId: number,
  input: { operator: 'gte'; value: number },
): Promise<EnergyUsageThreshold> {
  const response = await APIService.post(
    `${configPath(branchId, 'energy_usage_target')}/thresholds/`,
    input,
  );
  return unwrapData<EnergyUsageThreshold>(response);
}

export async function deleteEnergyUsageThreshold(
  branchId: number,
  thresholdId: number,
): Promise<void> {
  await APIService.delete(
    `${configPath(branchId, 'energy_usage_target')}/thresholds/${thresholdId}/`,
  );
}

export async function fetchDieselReminderConfig(
  branchId: number,
): Promise<DieselReminderConfig> {
  const response = await APIService.get(`${configPath(branchId, 'diesel_entry_reminder')}/`);
  return unwrapData<DieselReminderConfig>(response);
}

export async function updateDieselReminderConfig(
  branchId: number,
  patch: DieselConfigPatch,
): Promise<DieselReminderConfig> {
  const response = await APIService.put(
    `${configPath(branchId, 'diesel_entry_reminder')}/`,
    patch,
  );
  return unwrapData<DieselReminderConfig>(response);
}

export async function fetchCapacityThreshold(
  branchId: number,
): Promise<CapacityThresholdConfig> {
  const response = await APIService.get(`branches/${branchId}/capacity-threshold/`);
  return unwrapData<CapacityThresholdConfig>(response);
}

export async function updateCapacityThreshold(
  branchId: number,
  patch: CapacityPatch,
): Promise<CapacityThresholdConfig> {
  const response = await APIService.put(`branches/${branchId}/capacity-threshold/`, patch);
  return unwrapData<CapacityThresholdConfig>(response);
}
