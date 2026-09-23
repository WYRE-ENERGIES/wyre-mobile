import { isAxiosError, type AxiosResponse } from 'axios';

import { APIService } from '@/config/api/apiServices';

function unwrapData<T>(response: AxiosResponse): T {
  const body = response.data;
  if (body?.authenticatedData !== undefined) return body.authenticatedData as T;
  if (body?.data !== undefined) return body.data as T;
  return body as T;
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** Matches wyre-dashboard: `DD-MM-YYYY HH:mm`. */
export function formatScorecardDate(date: Date): string {
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function defaultScorecardDates(): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end.getFullYear(), end.getMonth(), 1, 0, 0, 0, 0);
  return { start: formatScorecardDate(start), end: formatScorecardDate(end) };
}

export type ScorecardBranchPayload = {
  devices?: {
    is_source?: boolean;
    is_generator?: boolean;
    name?: string;
    score_card?: Record<string, unknown>;
  }[];
  [key: string]: unknown;
};

/**
 * Do not pre-encode spaces. The web dashboard sends the date as
 * `01-09-2026 00:00/15-09-2026 11:17` and lets the HTTP client encode once.
 * Replacing spaces with `%20` first is re-encoded to `%2520` in React Native,
 * which 500s the backend.
 */
async function fetchScorecardEndpoint(
  path: string,
  branchId: number,
  start: string,
  end: string,
): Promise<ScorecardBranchPayload> {
  const response = await APIService.get(`scorecard/${path}/${branchId}/${start}/${end}/`);
  return unwrapData<ScorecardBranchPayload>(response);
}

const SCORECARD_PATHS = [
  { path: 'baseline-energy', key: 'baseline' },
  { path: 'peak-to-avg-power-ratio', key: 'papr' },
  { path: 'carbon-emissions', key: 'carbon' },
  { path: 'generator-size-efficiency', key: 'gen-size' },
  { path: 'fuel-consumption', key: 'fuel' },
  { path: 'operating-time', key: 'operating' },
] as const;

export type ScorecardDashboard = {
  baseline: ScorecardBranchPayload;
  papr: ScorecardBranchPayload;
  carbon: ScorecardBranchPayload;
  genSize: ScorecardBranchPayload;
  fuel: ScorecardBranchPayload;
  operating: ScorecardBranchPayload;
};

export function scorecardRequestError(error: unknown): string {
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
    if (status === 404) return 'Scorecard data was not found for this branch.';
    if (status === 401) return 'Please sign in again to view the scorecard.';
    if (status === 500) return 'The scorecard service is unavailable right now.';
  }
  if (error instanceof Error && error.message.trim()) return error.message;
  return 'Unable to load scorecard.';
}

export async function fetchScorecardDashboard(branchId: number): Promise<{
  data: ScorecardDashboard;
  failedKeys: string[];
}> {
  const { start, end } = defaultScorecardDates();
  const results = await Promise.allSettled(
    SCORECARD_PATHS.map((item) => fetchScorecardEndpoint(item.path, branchId, start, end)),
  );

  const failedKeys = SCORECARD_PATHS.filter((_, index) => results[index].status === 'rejected').map(
    (item) => item.key,
  );

  if (failedKeys.length === results.length) {
    const first = results[0];
    throw first.status === 'rejected' ? first.reason : new Error('Unable to load scorecard.');
  }

  const valueAt = (index: number): ScorecardBranchPayload => {
    const result = results[index];
    return result.status === 'fulfilled' ? result.value : {};
  };

  return {
    data: {
      baseline: valueAt(0),
      papr: valueAt(1),
      carbon: valueAt(2),
      genSize: valueAt(3),
      fuel: valueAt(4),
      operating: valueAt(5),
    },
    failedKeys,
  };
}
