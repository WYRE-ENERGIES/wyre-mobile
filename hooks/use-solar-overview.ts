import { useCallback, useEffect, useState } from 'react';

import { fetchSolarDashboard } from '@/lib/solar-api';
import type { SolarOverview, SolarSiteStatus, SolarYield } from '@/lib/solar-types';

type SolarOverviewState = {
  overview: SolarOverview | null;
  yield: SolarYield | null;
  siteStatus: SolarSiteStatus | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
};

const INITIAL_STATE: SolarOverviewState = {
  overview: null,
  yield: null,
  siteStatus: null,
  loading: true,
  refreshing: false,
  error: null,
};

export function useSolarOverview(branchId: number | null) {
  const [state, setState] = useState<SolarOverviewState>(INITIAL_STATE);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!branchId) {
        setState({
          ...INITIAL_STATE,
          loading: false,
          error: 'No branch assigned to this account.',
        });
        return;
      }

      setState((current) => ({
        ...current,
        loading: !isRefresh && current.overview === null,
        refreshing: isRefresh,
        error: null,
      }));

      try {
        const data = await fetchSolarDashboard(branchId);
        setState({
          overview: data.overview,
          yield: data.yield,
          siteStatus: data.siteStatus,
          loading: false,
          refreshing: false,
          error: null,
        });
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Unable to load solar overview.';
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

  const refresh = useCallback(() => load(true), [load]);

  return { ...state, refresh };
}
