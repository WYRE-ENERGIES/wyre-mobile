import { useCallback, useEffect, useState } from 'react';

import { fetchHourlyChart } from '@/lib/solar-api';
import type { SolarHourlyChart, YieldTabKey } from '@/lib/solar-types';

export function useHourlyChart(
  branchId: number | null,
  source: YieldTabKey,
  enabled = true,
) {
  const [data, setData] = useState<SolarHourlyChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!branchId || !enabled) return;
    setLoading(true);
    setError(null);
    try {
      const chart = await fetchHourlyChart(branchId, new Date(), source);
      setData(chart);
    } catch (err: unknown) {
      setData(null);
      setError(err instanceof Error ? err.message : 'Unable to load today’s energy chart.');
    } finally {
      setLoading(false);
    }
  }, [branchId, source, enabled]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, refresh: load };
}

export function useConsumptionChart(branchId: number | null) {
  return useHourlyChart(branchId, 'load', branchId != null);
}
