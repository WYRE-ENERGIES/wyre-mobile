import { useCallback, useEffect, useState } from 'react';

import {
  fetchCostTrackerDashboard,
  fetchDieselOverview,
  fetchUtilityOverview,
} from '@/lib/cost-tracker-api';
import type { CostTrackerDashboard } from '@/lib/cost-tracker-types';

type CostTrackerState = {
  data: CostTrackerDashboard | null;
  loading: boolean;
  refreshing: boolean;
  dieselLoading: boolean;
  utilityLoading: boolean;
  error: string | null;
};

export function useCostTracker(branchId: number | null) {
  const [state, setState] = useState<CostTrackerState>({
    data: null,
    loading: true,
    refreshing: false,
    dieselLoading: false,
    utilityLoading: false,
    error: null,
  });

  const load = useCallback(
    async (isRefresh = false) => {
      if (!branchId) {
        setState({
          data: null,
          loading: false,
          refreshing: false,
          dieselLoading: false,
          utilityLoading: false,
          error: 'No branch assigned to this account.',
        });
        return;
      }

      setState((current) => ({
        ...current,
        loading: !isRefresh && !current.data,
        refreshing: isRefresh,
        error: null,
      }));

      try {
        const data = await fetchCostTrackerDashboard(branchId);
        setState({
          data,
          loading: false,
          refreshing: false,
          dieselLoading: false,
          utilityLoading: false,
          error: null,
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Unable to load cost tracker.';
        setState((current) => ({
          ...current,
          loading: false,
          refreshing: false,
          error: message,
        }));
      }
    },
    [branchId],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const setDieselPage = useCallback(
    async (page: number) => {
      if (!branchId || !state.data || state.dieselLoading) return;

      setState((current) => ({ ...current, dieselLoading: true, error: null }));
      try {
        const result = await fetchDieselOverview(branchId, { page });
        setState((current) => ({
          ...current,
          data: current.data
            ? {
                ...current.data,
                dieselOverview: result.diesel_overview ?? [],
                dieselPagination: result.pagination,
              }
            : current.data,
          dieselLoading: false,
        }));
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Unable to load the diesel overview.';
        setState((current) => ({ ...current, dieselLoading: false, error: message }));
      }
    },
    [branchId, state.data, state.dieselLoading],
  );

  const setUtilityPage = useCallback(
    async (page: number) => {
      if (!branchId || !state.data || state.utilityLoading) return;

      setState((current) => ({ ...current, utilityLoading: true, error: null }));
      try {
        const result = await fetchUtilityOverview(branchId, { page });
        setState((current) => ({
          ...current,
          data: current.data
            ? {
                ...current.data,
                utilityOverview: result.utility_overview ?? [],
                utilityPagination: result.pagination,
              }
            : current.data,
          utilityLoading: false,
        }));
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Unable to load the utility overview.';
        setState((current) => ({ ...current, utilityLoading: false, error: message }));
      }
    },
    [branchId, state.data, state.utilityLoading],
  );

  return {
    ...state,
    refresh: () => load(true),
    setDieselPage,
    setUtilityPage,
  };
}
