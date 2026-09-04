import { useCallback, useEffect, useState } from 'react';

import { fetchConsumptionChart } from '@/lib/solar-api';
import type { SolarHourlyChart } from '@/lib/solar-types';

export function useConsumptionChart(branchId: number | null) {
  const [data, setData] = useState<SolarHourlyChart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError(null);
    try {
      const chart = await fetchConsumptionChart(branchId, new Date());
      setData(chart);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load today’s energy chart.');
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, refresh: load };
}
