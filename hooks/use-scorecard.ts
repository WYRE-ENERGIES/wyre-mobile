import { useCallback, useEffect, useState } from 'react';

import {
  defaultScorecardDateRange,
  fetchScorecardDashboard,
} from '@/lib/scorecard-api';
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
        const dateRange = defaultScorecardDateRange();
        const data = await fetchScorecardDashboard(branchId, dateRange);
        setState({
          metrics: buildScorecardMetrics(data),
          loading: false,
          refreshing: false,
          error: null,
          dateLabel: currentMonthLabel(),
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Unable to load scorecard.';
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
