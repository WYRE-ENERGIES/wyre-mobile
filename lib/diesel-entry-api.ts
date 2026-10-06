import { isAxiosError, type AxiosResponse } from 'axios';

import { APIService } from '@/config/api/apiServices';
import type {
  BranchGenerator,
  CreateDailyDieselEntryInput,
  CreateMonthlyDieselEntryInput,
  DieselDailyUsageEntry,
  DieselMonthlyUsageEntry,
  UpdateDailyDieselEntryInput,
  UpdateMonthlyDieselEntryInput,
} from '@/lib/diesel-entry-types';

function unwrapData<T>(response: AxiosResponse): T {
  const body = response.data;
  if (body?.data !== undefined) return body.data as T;
  if (body?.authenticatedData !== undefined) return body.authenticatedData as T;
  return body as T;
}

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function asString(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) return value.trim();
  return null;
}

function asIdList(value: unknown): number[] {
  if (Array.isArray(value)) {
    return value.map(asNumber).filter((id): id is number => id != null);
  }
  const single = asNumber(value);
  return single != null ? [single] : [];
}

function monthBounds(month: number, year: number): { startDate: string; endDate: string } {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    startDate: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`,
    endDate: `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`,
  };
}

function normalizeGenerators(payload: unknown): BranchGenerator[] {
  const root =
    payload && typeof payload === 'object'
      ? ((payload as { generators?: unknown }).generators ?? payload)
      : [];

  const rows = Array.isArray(root) ? root.flat(2) : [];
  const generators: BranchGenerator[] = [];

  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const record = row as Record<string, unknown>;
    const deviceId = asNumber(record.device_id ?? record.id);
    const name = asString(record.name) ?? asString(record.device_name);
    if (deviceId == null || !name) continue;
    generators.push({ deviceId, name });
  }

  return generators.sort((a, b) => a.name.localeCompare(b.name));
}

function normalizeDailyEntry(row: Record<string, unknown>): DieselDailyUsageEntry | null {
  const startDate = asString(row.start_date) ?? asString(row.date);
  const endDate = asString(row.end_date) ?? startDate;
  const quantity = asNumber(row.quantity);
  if (!startDate || quantity == null) return null;

  return {
    id: asNumber(row.id) ?? asNumber(row.fuel_consumption_id),
    startDate,
    endDate: endDate ?? startDate,
    recordTime: asString(row.record_time),
    quantity,
    generatorName: asString(row.generator_name),
    generatorIds: asIdList(row.device_id ?? row.generator_ids ?? row.generator_id),
  };
}

function normalizeMonthlyEntry(row: Record<string, unknown>): DieselMonthlyUsageEntry | null {
  const month = asNumber(row.month);
  const year = asNumber(row.year);
  const quantity = asNumber(row.quantity);
  if (month == null || year == null || quantity == null) return null;

  const bounds = monthBounds(month, year);
  return {
    id: asNumber(row.id) ?? asNumber(row.fuel_consumption_id),
    month,
    year,
    recordTime: asString(row.record_time),
    quantity,
    startDate: asString(row.start_date) ?? bounds.startDate,
    endDate: asString(row.end_date) ?? bounds.endDate,
  };
}

export function dieselEntryError(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    const body = error.response?.data;
    if (body && typeof body === 'object') {
      const record = body as Record<string, unknown>;
      if (typeof record.error === 'string' && record.error.trim()) return record.error;
      if (typeof record.message === 'string' && record.message.trim()) return record.message;
      if (typeof record.detail === 'string' && record.detail.trim()) return record.detail;
    }
    if (error.response?.status === 403) {
      return "You don't have permission to manage diesel entries for this branch.";
    }
    if (error.response?.status === 401) return 'Please sign in again to continue.';
    if (error.response?.status === 404) return 'Diesel entry endpoint was not found.';
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
}

export function canEditDieselEntry(recordTime: string | null | undefined, now = new Date()): boolean {
  if (!recordTime) return false;
  const recorded = new Date(recordTime);
  if (Number.isNaN(recorded.getTime())) return false;
  return now.getTime() - recorded.getTime() <= 30 * 60 * 1000;
}

export async function fetchBranchGenerators(branchId: number): Promise<BranchGenerator[]> {
  const response = await APIService.get(`branch/${branchId}/generators/`);
  return normalizeGenerators(unwrapData(response) ?? response.data);
}

export async function fetchDieselDailyUsageEntries(
  branchId: number,
): Promise<DieselDailyUsageEntry[]> {
  const response = await APIService.get(`cost-tracker/diesel-daily-usage/${branchId}/`);
  const rows = unwrapData<unknown>(response);
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) =>
      row && typeof row === 'object' ? normalizeDailyEntry(row as Record<string, unknown>) : null,
    )
    .filter((row): row is DieselDailyUsageEntry => row != null)
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

export async function fetchDieselMonthlyUsageEntries(
  branchId: number,
): Promise<DieselMonthlyUsageEntry[]> {
  const response = await APIService.get(`cost-tracker/diesel-monthly-usage/${branchId}/`);
  const rows = unwrapData<unknown>(response);
  if (!Array.isArray(rows)) return [];
  return rows
    .map((row) =>
      row && typeof row === 'object' ? normalizeMonthlyEntry(row as Record<string, unknown>) : null,
    )
    .filter((row): row is DieselMonthlyUsageEntry => row != null)
    .sort((a, b) => b.year - a.year || b.month - a.month);
}

export async function createDailyDieselEntry(
  branchId: number,
  input: CreateDailyDieselEntryInput,
): Promise<void> {
  await APIService.post(`fuel-entry/${branchId}/`, {
    quantity: input.quantity,
    start_date: input.startDate,
    end_date: input.endDate,
    fuel_type: 'diesel',
    generator_ids: input.generatorIds?.length ? input.generatorIds : undefined,
    consumption_type: 'Daily',
  });
}

export async function createMonthlyDieselEntry(
  branchId: number,
  input: CreateMonthlyDieselEntryInput,
): Promise<void> {
  await APIService.post(`monthly-fuel-entry/${branchId}/`, {
    branch: branchId,
    quantity: input.quantity,
    start_date: input.startDate,
    end_date: input.endDate,
    fuel_type: 'diesel',
    consumption_type: 'Monthly',
  });
}

export async function updateDailyDieselEntry(
  branchId: number,
  input: UpdateDailyDieselEntryInput,
): Promise<void> {
  await APIService.patch(`fuel-entry/${branchId}/`, {
    quantity: input.quantity,
    start_date: input.startDate,
    end_date: input.endDate,
    fuel_type: 'diesel',
    generator_ids: input.generatorIds?.length ? input.generatorIds : undefined,
    consumption_type: 'Daily',
    entry_id: input.entryId,
  });
}

export async function updateMonthlyDieselEntry(
  branchId: number,
  input: UpdateMonthlyDieselEntryInput,
): Promise<void> {
  await APIService.patch(`fuel-entry/${branchId}/`, {
    quantity: input.quantity,
    start_date: input.startDate,
    end_date: input.endDate,
    consumption_type: 'Monthly',
    entry_id: input.entryId,
  });
}
