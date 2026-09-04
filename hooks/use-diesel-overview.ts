import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';

import { fetchDieselDetails, fetchDieselOverview } from '@/lib/diesel-api';
import type { DieselDetailsData, DieselOverviewData } from '@/lib/diesel-types';

export function useDieselOverview(branchId: number | null, month: number, year: number) {
  const [data, setData] = useState<DieselOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  const load = useCallback(
    async (isRefresh = false) => {
      if (!branchId) {
        setLoading(false);
        setError('No branch assigned to this account.');
        return;
      }

      setLoading((currentLoading) => (isRefresh ? currentLoading : true));
      setRefreshing(isRefresh);
      setError(null);
      setUnavailable(false);

      try {
        const next = await fetchDieselOverview(branchId, month, year);
        setData(next);
      } catch (err: unknown) {
        const status = isAxiosError(err) ? err.response?.status : undefined;
        if (status === 401 || status === 403 || status === 404) {
          setData(null);
          setUnavailable(true);
        } else {
          setError('Diesel data could not be loaded right now.');
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [branchId, month, year],
  );

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, refreshing, error, unavailable, refresh: () => load(true) };
}

export function useDieselDetails(
  branchId: number | null,
  month: number,
  year: number,
  enabled: boolean,
) {
  const [data, setData] = useState<DieselDetailsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !branchId) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchDieselDetails(branchId, month, year)
      .then((next) => {
        if (!cancelled) setData(next);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load diesel details.');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [branchId, month, year, enabled]);

  return { data, loading, error };
}
