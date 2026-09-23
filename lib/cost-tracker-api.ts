import { isAxiosError, type AxiosResponse } from 'axios';

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

export function dieselTrackerOverviewError(error: unknown): string {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const body = error.response?.data;
    if (body && typeof body === 'object') {
      const record = body as Record<string, unknown>;
      if (typeof record.message === 'string' && record.message.trim()) {
        return record.message;
      }
      if (typeof record.detail === 'string' && record.detail.trim()) {
        return record.detail;
      }
    }
    if (status === 403) return "You don't have permission to view this branch.";
    if (status === 404) return 'Branch not found.';
    if (status === 400) return 'Invalid month or year for diesel overview.';
    if (status === 401) return 'Please sign in again to view diesel entries.';
  }
  return 'Unable to load daily diesel entries.';
}

export async function fetchDieselDailyUsage(
  branchId: number,
  year: number | string,
  month: number | string,
): Promise<DieselDailyEntry[]> {
  const yearNum = Number(year);
  const monthNum = Number(month);
  const response = await APIService.get(
    `diesel_tracker_overview/${branchId}/${yearNum}/${monthNum}/`,
  );
  const rows = unwrapData<DieselDailyEntry[]>(response);
  return Array.isArray(rows) ? rows : [];
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
