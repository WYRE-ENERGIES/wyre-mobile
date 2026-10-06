import type { AxiosResponse } from 'axios';

import { APIService } from '@/config/api/apiServices';
import type {
  DieselDetailsData,
  DieselEnergyGenerator,
  DieselFuelPoint,
  DieselGeneratorStatus,
  DieselOverviewData,
  DieselPrice,
  DieselRuntimeGenerator,
} from '@/lib/diesel-types';

function unwrap(response: AxiosResponse): unknown {
  const body = response.data;
  if (body && typeof body === 'object' && 'data' in body) {
    return (body as { data: unknown }).data;
  }
  return body;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function asNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function metricValue(value: unknown): number {
  if (value && typeof value === 'object' && 'value' in value) {
    return asNumber((value as { value: unknown }).value);
  }
  return asNumber(value);
}

export async function fetchDieselOverview(
  branchId: number,
  month: number,
  year: number,
): Promise<DieselOverviewData> {
  const query = `month=${month}&year=${year}`;
  const results = await Promise.allSettled([
    APIService.get(`branch/${branchId}/generators-status/`),
    APIService.get(`branch/${branchId}/diesel-price/`),
    APIService.get(`branch/${branchId}/generators-co2/?${query}`),
    APIService.get(`branch/${branchId}/generators-monthly-energy/?${query}`),
    APIService.get(`branch/${branchId}/generator-runtime-fuel-usage/?${query}`),
  ]);

  const fulfilled = results.filter(
    (result): result is PromiseFulfilledResult<AxiosResponse> => result.status === 'fulfilled',
  );
  if (fulfilled.length === 0) {
    const firstFailure = results.find(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    );
    throw firstFailure?.reason ?? new Error('Unable to load diesel overview.');
  }

  const valueAt = (index: number): Record<string, unknown> => {
    const result = results[index];
    return result?.status === 'fulfilled' ? asRecord(unwrap(result.value)) : {};
  };

  const statusData = valueAt(0);
  const priceData = valueAt(1);
  const co2Data = valueAt(2);
  const energyData = valueAt(3);
  const runtimeData = valueAt(4);

  const generators = (Array.isArray(statusData.generators) ? statusData.generators : []).map(
    (item: unknown) => {
      const row = asRecord(item);
      return {
        name: asString(row.name) || 'Generator',
        is_currently_on: Boolean(row.is_currently_on),
        last_usage_time_relative: asString(row.last_usage_time_relative),
      } satisfies DieselGeneratorStatus;
    },
  );

  const price: DieselPrice = {
    diesel_price_per_litre: asNumber(priceData.diesel_price_per_litre),
    diesel_efficiency: asNumber(priceData.diesel_efficiency),
    month_estimated_cost: asNumber(priceData.month_estimated_cost),
  };

  const energyGenerators = (
    Array.isArray(energyData.generators) ? energyData.generators : []
  ).map((item: unknown) => {
    const row = asRecord(item);
    return {
      name: asString(row.name) || 'Generator',
      energy: asNumber(row.energy),
    } satisfies DieselEnergyGenerator;
  });

  const runtimeGenerators = (
    Array.isArray(runtimeData.generators) ? runtimeData.generators : []
  ).map((item: unknown) => {
    const row = asRecord(item);
    return {
      name: asString(row.name) || 'Generator',
      runtime_hours: asNumber(row.runtime_hours),
      runtime_formatted: asString(row.runtime_formatted),
      fuel_liters: asNumber(row.fuel_liters),
    } satisfies DieselRuntimeGenerator;
  });

  return {
    generators,
    price,
    co2Tonnes: asNumber(co2Data.total_co2_tonnes),
    totalEnergy: asNumber(energyData.total_energy),
    energyGenerators,
    runtimeGenerators,
    totalRuntime: (runtimeData.total_runtime as string | number | undefined) ?? 0,
    totalFuelLiters: asNumber(runtimeData.total_fuel_liters),
  };
}

export async function fetchDieselDetails(
  branchId: number,
  month: number,
  year: number,
): Promise<DieselDetailsData> {
  const query = `month=${month}&year=${year}`;
  const [fuelRes, metricsRes, costRes] = await Promise.all([
    APIService.get(`branch/${branchId}/fuel-usage-series/?${query}&frequency=daily`),
    APIService.get(`branch/${branchId}/generator-metrics/?${query}`),
    APIService.get(`branch/${branchId}/cost-metrics/?${query}`),
  ]);

  const fuelData = asRecord(unwrap(fuelRes));
  const metrics = asRecord(unwrap(metricsRes));
  const cost = asRecord(unwrap(costRes));

  const series = (Array.isArray(fuelData.series) ? fuelData.series : []) as unknown[];
  const fuelSeries: DieselFuelPoint[] = series.map((item) => {
    const row = asRecord(item);
    return {
      date: asString(row.date),
      fuel_liters: asNumber(row.fuel_liters),
      predicted_liters: asNumber(row.predicted_liters),
    };
  });

  return {
    fuelSeries,
    fuelEfficiency: metricValue(metrics.fuel_efficiency),
    specificConsumption: metricValue(metrics.fuel_consumption),
    efficiencyScore: metricValue(metrics.generator_efficiency_score),
    totalCost: metricValue(cost.total_cost),
    blendedCost: metricValue(cost.blended_cost),
    annualCost: metricValue(cost.annual_cost_forecast),
  };
}
