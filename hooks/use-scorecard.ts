import { useCallback, useEffect, useState } from 'react';

import { fetchScorecardDashboard, scorecardRequestError } from '@/lib/scorecard-api';
import { buildScorecardMetrics, type ScorecardMetric } from '@/lib/scorecard-metrics';

type ScorecardState = {
  metrics: ScorecardMetric[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  dateLabel: string;
};

function currentMonthLabel(): string {
  return new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}

export function useScorecard(branchId: number | null) {
  const [state, setState] = useState<ScorecardState>({
    metrics: [],
    loading: true,
    refreshing: false,
    error: null,
    dateLabel: currentMonthLabel(),
  });

  const load = useCallback(
    async (isRefresh = false) => {
      if (!branchId) {
        setState((current) => ({
          ...current,
          loading: false,
          refreshing: false,
          error: 'No branch assigned to this account.',
          metrics: [],
        }));
        return;
      }

      setState((current) => ({
        ...current,
        loading: !isRefresh && current.metrics.length === 0,
        refreshing: isRefresh,
        error: null,
      }));

      try {
        const { data, failedKeys } = await fetchScorecardDashboard(branchId);
        setState({
          metrics: buildScorecardMetrics(data, failedKeys),
          loading: false,
          refreshing: false,
          error: null,
          dateLabel: currentMonthLabel(),
        });
      } catch (error: unknown) {
        setState((current) => ({
          ...current,
          loading: false,
          refreshing: false,
          error: scorecardRequestError(error),
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
