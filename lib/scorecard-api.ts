import type { AxiosResponse } from 'axios';

import { APIService } from '@/config/api/apiServices';

function unwrapData<T>(response: AxiosResponse): T {
  const body = response.data;
  if (body?.authenticatedData !== undefined) return body.authenticatedData as T;
  if (body?.data !== undefined) return body.data as T;
  return body as T;
}

/** Matches wyre-dashboard scorecard date path segment. */
export function formatScorecardDateRange(start: Date, end: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const fmt = (d: Date) =>
    `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return `${fmt(start)}/${fmt(end)}`;
}

export function defaultScorecardDateRange(): string {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), 1, 0, 0, 0, 0);
  return formatScorecardDateRange(start, end);
}

export type ScorecardBranchPayload = {
  devices?: Array<{
    is_source?: boolean;
    is_generator?: boolean;
    name?: string;
    score_card?: Record<string, unknown>;
  }>;
  [key: string]: unknown;
};

/** Encode spaces in date path segments — matches backend expectations. */
export function encodeScorecardDateRange(dateRange: string): string {
  return dateRange.replace(/ /g, '%20');
}

async function fetchScorecardEndpoint(
  path: string,
  branchId: number,
  dateRange: string,
): Promise<ScorecardBranchPayload> {
  const encodedRange = encodeScorecardDateRange(dateRange);
  const response = await APIService.get(`scorecard/${path}/${branchId}/${encodedRange}/`);
  return unwrapData<ScorecardBranchPayload>(response);
}

export async function fetchBaselineEnergy(branchId: number, dateRange: string) {
  return fetchScorecardEndpoint('baseline-energy', branchId, dateRange);
}

export async function fetchPeakToAvgPowerRatio(branchId: number, dateRange: string) {
  return fetchScorecardEndpoint('peak-to-avg-power-ratio', branchId, dateRange);
}

export async function fetchCarbonEmissions(branchId: number, dateRange: string) {
  return fetchScorecardEndpoint('carbon-emissions', branchId, dateRange);
}

export async function fetchGeneratorSizeEfficiency(branchId: number, dateRange: string) {
  return fetchScorecardEndpoint('generator-size-efficiency', branchId, dateRange);
}

export async function fetchFuelConsumption(branchId: number, dateRange: string) {
  return fetchScorecardEndpoint('fuel-consumption', branchId, dateRange);
}

export async function fetchOperatingTime(branchId: number, dateRange: string) {
  return fetchScorecardEndpoint('operating-time', branchId, dateRange);
}

export async function fetchScorecardDashboard(branchId: number, dateRange: string) {
  const [baseline, papr, carbon, genSize, fuel, operating] = await Promise.all([
    fetchBaselineEnergy(branchId, dateRange),
    fetchPeakToAvgPowerRatio(branchId, dateRange),
    fetchCarbonEmissions(branchId, dateRange),
    fetchGeneratorSizeEfficiency(branchId, dateRange),
    fetchFuelConsumption(branchId, dateRange),
    fetchOperatingTime(branchId, dateRange),
  ]);

  return { baseline, papr, carbon, genSize, fuel, operating };
}
