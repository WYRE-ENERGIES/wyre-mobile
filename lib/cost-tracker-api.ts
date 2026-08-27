import type { AxiosResponse } from 'axios';

import { APIService } from '@/config/api/apiServices';
import type {
  CostTrackerBaseline,
  CostTrackerBranchOverview,
  DieselDailyEntry,
  DieselOverviewRow,
  UtilityOverviewRow,
} from '@/lib/cost-tracker-types';

function unwrapData<T>(response: AxiosResponse): T {
  const body = response.data;
  if (body?.data !== undefined) return body.data as T;
  if (body?.authenticatedData !== undefined) return body.authenticatedData as T;
  return body as T;
}

export async function fetchCostTrackerOverview(branchId: number): Promise<CostTrackerBranchOverview> {
  const response = await APIService.get(`cost-tracker/branch-overview/${branchId}/`);
  return unwrapData<CostTrackerBranchOverview>(response);
}

export async function fetchDieselOverview(branchId: number): Promise<{ diesel_overview?: DieselOverviewRow[] }> {
  const response = await APIService.get(`cost-tracker/diesel-overview/${branchId}/`);
  return unwrapData<{ diesel_overview?: DieselOverviewRow[] }>(response);
}

export async function fetchUtilityOverview(branchId: number): Promise<{ utility_overview?: UtilityOverviewRow[] }> {
  const response = await APIService.get(`cost-tracker/utility-overview/${branchId}/`);
  return unwrapData<{ utility_overview?: UtilityOverviewRow[] }>(response);
}

export async function fetchCostTrackerBaseline(branchId: number): Promise<CostTrackerBaseline> {
  const response = await APIService.get(`cost-tracker/baseline/${branchId}/`);
  return unwrapData<CostTrackerBaseline>(response);
}

export async function fetchDieselDailyUsage(
  userId: string,
  year: string,
  month: string,
): Promise<DieselDailyEntry[]> {
  const response = await APIService.get(`diesel_tracker_overview/${userId}/${year}/${month}/`);
  return unwrapData<DieselDailyEntry[]>(response);
}

export async function fetchCostTrackerDashboard(branchId: number) {
  const [overview, diesel, utility, baseline] = await Promise.all([
    fetchCostTrackerOverview(branchId),
    fetchDieselOverview(branchId),
    fetchUtilityOverview(branchId),
    fetchCostTrackerBaseline(branchId),
  ]);

  return {
    overview,
    dieselOverview: diesel.diesel_overview ?? [],
    utilityOverview: utility.utility_overview ?? [],
    baseline,
  };
}
