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
  is_enabled: boolean;
  push_enabled: boolean;
  email_enabled: boolean;
  schedule_times: NotificationScheduleTime[];
  thresholds: BatterySocThreshold[];
  updated_at: string;
};

export type CapacityThresholdConfig = {
  branch_id: number;
  branch_name?: string;
  threshold_pct: number;
  enabled: boolean;
};

export type NotificationSettingsError = {
  status: number | null;
  message: string;
};

type BatteryConfigPatch = Partial<
  Pick<BatteryNotificationConfig, 'is_enabled' | 'push_enabled' | 'email_enabled'>
>;

type CapacityPatch = Partial<Pick<CapacityThresholdConfig, 'threshold_pct' | 'enabled'>>;

function unwrapData<T>(response: AxiosResponse): T {
  const body = response.data;
  if (body?.data !== undefined) return body.data as T;
  return body as T;
}

function basePath(branchId: number) {
  return `branches/${branchId}/notification-configs/daily_battery_soc`;
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
  const response = await APIService.get(`${basePath(branchId)}/`);
  return unwrapData<BatteryNotificationConfig>(response);
}

export async function updateBatteryNotificationConfig(
  branchId: number,
  patch: BatteryConfigPatch,
): Promise<BatteryNotificationConfig> {
  const response = await APIService.put(`${basePath(branchId)}/`, patch);
  return unwrapData<BatteryNotificationConfig>(response);
}

export async function addBatteryScheduleTime(
  branchId: number,
  input: { time: string; days_of_week: string },
): Promise<NotificationScheduleTime> {
  const response = await APIService.post(`${basePath(branchId)}/times/`, input);
  return unwrapData<NotificationScheduleTime>(response);
}

export async function deleteBatteryScheduleTime(
  branchId: number,
  timeId: number,
): Promise<void> {
  await APIService.delete(`${basePath(branchId)}/times/${timeId}/`);
}

export async function addBatterySocThreshold(
  branchId: number,
  input: { operator: BatteryThresholdOperator; value: number },
): Promise<BatterySocThreshold> {
  const response = await APIService.post(`${basePath(branchId)}/thresholds/`, input);
  return unwrapData<BatterySocThreshold>(response);
}

export async function deleteBatterySocThreshold(
  branchId: number,
  thresholdId: number,
): Promise<void> {
  await APIService.delete(`${basePath(branchId)}/thresholds/${thresholdId}/`);
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
