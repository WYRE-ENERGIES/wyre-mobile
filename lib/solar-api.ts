import type { AxiosResponse } from 'axios';

import { APIService } from '@/config/api/apiServices';
import type {
  BatteryYieldPeriod,
  BatteryYieldTab,
  EnergyYieldPeriod,
  EnergyYieldTab,
  SolarHourlyChart,
  SolarHourlyPoint,
  SolarLiveOverlay,
  SolarOverview,
  SolarSiteStatus,
  SolarYield,
  SOLAR_OVERLAY_FALLBACK_MESSAGE,
  YieldTabKey,
} from '@/lib/solar-types';

function getMonthYear(date: Date) {
  return { month: date.getMonth() + 1, year: date.getFullYear() };
}

function unwrapData<T>(response: AxiosResponse): T {
  const body = response.data;
  if (body?.data !== undefined) return body.data as T;
  return body as T;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function asNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function parseEnergyPeriod(raw: unknown): EnergyYieldPeriod {
  const row = asRecord(raw);
  return {
    kwh: asNumber(row.kwh),
    cost: asNumber(row.cost),
    period_label: asOptionalString(row.period_label),
  };
}

function parseBatteryPeriod(raw: unknown): BatteryYieldPeriod {
  const row = asRecord(raw);
  return {
    charge_kwh: asNumber(row.charge_kwh),
    charge_cost: asNumber(row.charge_cost),
    discharge_kwh: asNumber(row.discharge_kwh),
    discharge_cost: asNumber(row.discharge_cost),
    period_label: asOptionalString(row.period_label),
  };
}

function parseEnergyTab(raw: unknown): EnergyYieldTab {
  const row = asRecord(raw);
  return {
    today: parseEnergyPeriod(row.today),
    monthly: parseEnergyPeriod(row.monthly),
    total: parseEnergyPeriod(row.total),
  };
}

function parseBatteryTab(raw: unknown): BatteryYieldTab {
  const row = asRecord(raw);
  return {
    today: parseBatteryPeriod(row.today),
    monthly: parseBatteryPeriod(row.monthly),
    total: parseBatteryPeriod(row.total),
  };
}

export function parseSolarYield(raw: unknown): SolarYield {
  const row = asRecord(raw);
  return {
    branch_id: asNumber(row.branch_id) || undefined,
    as_of: asOptionalString(row.as_of),
    blended_cost: row.blended_cost == null ? undefined : asNumber(row.blended_cost),
    generation: parseEnergyTab(row.generation),
    battery: parseBatteryTab(row.battery),
    load: parseEnergyTab(row.load),
    grid: parseEnergyTab(row.grid),
  };
}

function firstNumber(row: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    if (row[key] != null && row[key] !== '') return asNumber(row[key]);
  }
  return 0;
}

function parseHourlyPoint(raw: unknown): SolarHourlyPoint {
  const point = asRecord(raw);
  return {
    hour_label:
      asOptionalString(point.hour_label) ??
      asOptionalString(point.hour) ??
      asOptionalString(point.time) ??
      '',
    pv_kw: firstNumber(point, ['pv_kw', 'production_kw', 'generation_kw']),
    grid_kw: firstNumber(point, ['grid_kw', 'utility_kw']),
    load_kw: firstNumber(point, ['load_kw', 'consumption_kw']),
    backup_load_kwh: firstNumber(point, ['backup_load_kwh', 'backup_kwh']),
    battery_charge_kwh: firstNumber(point, [
      'battery_charge_kwh',
      'charge_kwh',
      'charging_kwh',
      'battery_charge',
    ]),
    battery_discharge_kwh: firstNumber(point, [
      'battery_discharge_kwh',
      'discharge_kwh',
      'discharging_kwh',
      'battery_discharge',
    ]),
  };
}

function parseHourlyChart(raw: unknown): SolarHourlyChart {
  const row = asRecord(raw);
  const hours = Array.isArray(row.hours)
    ? row.hours
    : Array.isArray(raw)
      ? raw
      : [];
  return { hours: hours.map(parseHourlyPoint) };
}

export async function fetchSolarOverview(branchId: number): Promise<SolarOverview> {
  const response = await APIService.get(`solar/overview/${branchId}/`);
  return unwrapData<SolarOverview>(response);
}

export async function fetchSolarYield(branchId: number): Promise<SolarYield> {
  const response = await APIService.get(`solar/yield/${branchId}/`);
  return parseSolarYield(unwrapData(response));
}

export async function fetchSolarSiteStatus(branchId: number): Promise<SolarSiteStatus> {
  const response = await APIService.get(`solar/site-status/${branchId}/`);
  return unwrapData<SolarSiteStatus>(response);
}

export function parseSolarLiveOverlay(raw: unknown): SolarLiveOverlay {
  const row = asRecord(raw);
  const overlay = asRecord(row.overlay);
  const message =
    typeof overlay.message === 'string' && overlay.message.trim()
      ? overlay.message.trim()
      : SOLAR_OVERLAY_FALLBACK_MESSAGE;
  return {
    message,
    isOverlay: overlay.is_overlay === true,
  };
}

export function mergeSolarOverlays(overlays: SolarLiveOverlay[]): SolarLiveOverlay {
  const active = overlays.filter((item) => item.isOverlay);
  if (active.length === 0) {
    return {
      message: SOLAR_OVERLAY_FALLBACK_MESSAGE,
      isOverlay: false,
    };
  }
  const custom = active.find((item) => item.message !== SOLAR_OVERLAY_FALLBACK_MESSAGE);
  return {
    isOverlay: true,
    message: (custom ?? active[0]).message,
  };
}

export async function fetchSolarLiveOverlay(branchId: number): Promise<SolarLiveOverlay> {
  const response = await APIService.get(`solar/live/${branchId}/`);
  return parseSolarLiveOverlay(unwrapData(response));
}

export async function fetchSolarDashboard(branchId: number) {
  const [overviewRes, yieldRes, siteRes, liveOverlay] = await Promise.all([
    APIService.get(`solar/overview/${branchId}/`),
    APIService.get(`solar/yield/${branchId}/`),
    APIService.get(`solar/site-status/${branchId}/`),
    fetchSolarLiveOverlay(branchId).catch(() => ({
      message: SOLAR_OVERLAY_FALLBACK_MESSAGE,
      isOverlay: false,
    })),
  ]);

  const overviewRaw = unwrapData(overviewRes);
  const yieldRaw = unwrapData(yieldRes);
  const siteRaw = unwrapData(siteRes);

  return {
    overview: overviewRaw as SolarOverview,
    yield: parseSolarYield(yieldRaw),
    siteStatus: siteRaw as SolarSiteStatus,
    overlay: mergeSolarOverlays([
      parseSolarLiveOverlay(overviewRaw),
      parseSolarLiveOverlay(yieldRaw),
      parseSolarLiveOverlay(siteRaw),
      liveOverlay,
    ]),
  };
}

export async function fetchHourlyChart(
  branchId: number,
  date: Date,
  source: YieldTabKey,
): Promise<SolarHourlyChart> {
  const { month, year } = getMonthYear(date);
  const day = date.getDate();
  const endpoint =
    source === 'battery'
      ? `solar/${branchId}/battery-backup-hourly-plot/`
      : source === 'generation'
        ? `solar/${branchId}/pv-production-hourly-plot/`
        : `solar/${branchId}/consumption-hourly-plot/`;
  const response = await APIService.get(`${endpoint}?month=${month}&year=${year}&day=${day}`);
  return parseHourlyChart(unwrapData(response));
}

export async function fetchConsumptionChart(
  branchId: number,
  date: Date,
): Promise<SolarHourlyChart> {
  return fetchHourlyChart(branchId, date, 'load');
}
