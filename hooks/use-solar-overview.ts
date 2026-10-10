import { useCallback, useEffect, useState } from 'react';

import { fetchSolarDashboard, fetchSolarLiveOverlay } from '@/lib/solar-api';
import {
  SOLAR_OVERLAY_FALLBACK_MESSAGE,
  type SolarLiveOverlay,
  type SolarOverview,
  type SolarSiteStatus,
  type SolarYield,
} from '@/lib/solar-types';

type SolarOverviewState = {
  overview: SolarOverview | null;
  yield: SolarYield | null;
  siteStatus: SolarSiteStatus | null;
  overlay: SolarLiveOverlay;
  overlayDismissed: boolean;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
};

const INITIAL_OVERLAY: SolarLiveOverlay = {
  message: SOLAR_OVERLAY_FALLBACK_MESSAGE,
  isOverlay: false,
};

const INITIAL_STATE: SolarOverviewState = {
  overview: null,
  yield: null,
  siteStatus: null,
  overlay: INITIAL_OVERLAY,
  overlayDismissed: false,
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
        const [data, overlay] = await Promise.all([
          fetchSolarDashboard(branchId),
          fetchSolarLiveOverlay(branchId).catch(() => INITIAL_OVERLAY),
        ]);
        setState((current) => ({
          overview: data.overview,
          yield: data.yield,
          siteStatus: data.siteStatus,
          overlay,
          overlayDismissed: overlay.isOverlay ? current.overlayDismissed : false,
          loading: false,
          refreshing: false,
          error: null,
        }));
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

  const dismissOverlay = useCallback(() => {
    setState((current) => ({ ...current, overlayDismissed: true }));
  }, []);

  return {
    overview: state.overview,
    yield: state.yield,
    siteStatus: state.siteStatus,
    loading: state.loading,
    refreshing: state.refreshing,
    error: state.error,
    refresh,
    overlay: {
      visible: state.overlay.isOverlay && !state.overlayDismissed,
      message: state.overlay.message,
      dismiss: dismissOverlay,
    },
  };
}
