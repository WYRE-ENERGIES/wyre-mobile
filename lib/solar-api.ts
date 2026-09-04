import type { AxiosResponse } from 'axios';

import { APIService } from '@/config/api/apiServices';
import type {
  SolarHourlyChart,
  SolarOverview,
  SolarSiteStatus,
  SolarYield,
} from '@/lib/solar-types';

function getMonthYear(date: Date) {
  return { month: date.getMonth() + 1, year: date.getFullYear() };
}

function unwrapData<T>(response: AxiosResponse): T {
  const body = response.data;
  if (body?.data !== undefined) return body.data as T;
  return body as T;
}

export async function fetchSolarOverview(branchId: number): Promise<SolarOverview> {
  const response = await APIService.get(`solar/overview/${branchId}/`);
  return unwrapData<SolarOverview>(response);
}

export async function fetchSolarYield(branchId: number): Promise<SolarYield> {
  const response = await APIService.get(`solar/yield/${branchId}/`);
  return unwrapData<SolarYield>(response);
}

export async function fetchSolarSiteStatus(branchId: number): Promise<SolarSiteStatus> {
  const response = await APIService.get(`solar/site-status/${branchId}/`);
  return unwrapData<SolarSiteStatus>(response);
}

export async function fetchSolarDashboard(branchId: number) {
  const [overview, yieldData, siteStatus] = await Promise.all([
    fetchSolarOverview(branchId),
    fetchSolarYield(branchId),
    fetchSolarSiteStatus(branchId),
  ]);

  return { overview, yield: yieldData, siteStatus };
}

export async function fetchConsumptionChart(
  branchId: number,
  date: Date,
): Promise<SolarHourlyChart> {
  const { month, year } = getMonthYear(date);
  const day = date.getDate();
  const response = await APIService.get(
    `solar/${branchId}/consumption-hourly-plot/?month=${month}&year=${year}&day=${day}`,
  );
  return unwrapData<SolarHourlyChart>(response);
}
