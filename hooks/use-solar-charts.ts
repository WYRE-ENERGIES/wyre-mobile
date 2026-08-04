import { useCallback, useEffect, useState } from 'react';

import {
  fetchBatteryChart,
  fetchConsumptionChart,
  fetchPvProductionChart,
} from '@/lib/solar-api';
import type { SolarHourlyChart } from '@/lib/solar-types';

type ChartSliceState = {
  data: SolarHourlyChart | null;
  loading: boolean;
  error: string | null;
  date: Date;
};

function createInitialChartState(): ChartSliceState {
  return {
    data: null,
    loading: true,
    error: null,
    date: new Date(),
  };
}

export function useSolarCharts(branchId: number | null) {
  const [consumption, setConsumption] = useState<ChartSliceState>(createInitialChartState);
  const [pvProduction, setPvProduction] = useState<ChartSliceState>(createInitialChartState);
  const [battery, setBattery] = useState<ChartSliceState>(createInitialChartState);

  const loadConsumption = useCallback(
    async (date: Date) => {
      if (!branchId) return;
      setConsumption((current) => ({ ...current, loading: true, error: null, date }));
      try {
        const data = await fetchConsumptionChart(branchId, date);
        setConsumption({ data, loading: false, error: null, date });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unable to load consumption chart.';
        setConsumption((current) => ({ ...current, loading: false, error: message }));
      }
    },
    [branchId],
  );

  const loadPvProduction = useCallback(
    async (date: Date) => {
      if (!branchId) return;
      setPvProduction((current) => ({ ...current, loading: true, error: null, date }));
      try {
        const data = await fetchPvProductionChart(branchId, date);
        setPvProduction({ data, loading: false, error: null, date });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unable to load PV production chart.';
        setPvProduction((current) => ({ ...current, loading: false, error: message }));
      }
    },
    [branchId],
  );

  const loadBattery = useCallback(
    async (date: Date) => {
      if (!branchId) return;
      setBattery((current) => ({ ...current, loading: true, error: null, date }));
      try {
        const data = await fetchBatteryChart(branchId, date);
        setBattery({ data, loading: false, error: null, date });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unable to load battery chart.';
        setBattery((current) => ({ ...current, loading: false, error: message }));
      }
    },
    [branchId],
  );

  useEffect(() => {
    if (!branchId) return;
    const today = new Date();
    void loadConsumption(today);
    void loadPvProduction(today);
    void loadBattery(today);
  }, [branchId, loadConsumption, loadPvProduction, loadBattery]);

  return {
    consumption,
    pvProduction,
    battery,
    setConsumptionDate: loadConsumption,
    setPvProductionDate: loadPvProduction,
    setBatteryDate: loadBattery,
  };
}
