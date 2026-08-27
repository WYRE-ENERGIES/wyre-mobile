import { useCallback, useEffect, useState } from 'react';

import { fetchCostTrackerDashboard } from '@/lib/cost-tracker-api';
import type { CostTrackerDashboard } from '@/lib/cost-tracker-types';

type CostTrackerState = {
  data: CostTrackerDashboard | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
};

export function useCostTracker(branchId: number | null) {
  const [state, setState] = useState<CostTrackerState>({
    data: null,
    loading: true,
    refreshing: false,
    error: null,
  });

  const load = useCallback(
    async (isRefresh = false) => {
      if (!branchId) {
        setState({
          data: null,
          loading: false,
          refreshing: false,
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

  return {
    ...state,
    refresh: () => load(true),
  };
}
