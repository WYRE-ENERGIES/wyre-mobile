import type { AxiosResponse } from 'axios';

import { APIService } from '@/config/api/apiServices';
import type {
  CostTrackerBaseline,
  CostTrackerBranchOverview,
  DieselDailyEntry,
  DieselOverviewResponse,
  UtilityOverviewResponse,
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

type OverviewPaginationParams = {
  page?: number;
  pageSize?: number;
};

function unwrapOverview<T extends object>(response: AxiosResponse): T {
  const body = response.data;
  const data = body?.data ?? body?.authenticatedData ?? body;
  return {
    ...data,
    pagination: body?.pagination,
  } as T;
}

export async function fetchDieselOverview(
  branchId: number,
  { page = 1, pageSize = 12 }: OverviewPaginationParams = {},
): Promise<DieselOverviewResponse> {
  const response = await APIService.get(`cost-tracker/diesel-overview/${branchId}/`, {
    params: { page, page_size: pageSize },
  });
  return unwrapOverview<DieselOverviewResponse>(response);
}

export async function fetchUtilityOverview(
  branchId: number,
  { page = 1, pageSize = 12 }: OverviewPaginationParams = {},
): Promise<UtilityOverviewResponse> {
  const response = await APIService.get(`cost-tracker/utility-overview/${branchId}/`, {
    params: { page, page_size: pageSize },
  });
  return unwrapOverview<UtilityOverviewResponse>(response);
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
    dieselPagination: diesel.pagination,
    utilityOverview: utility.utility_overview ?? [],
    utilityPagination: utility.pagination,
    baseline,
  };
}
