import { APIService } from '@/config/api/apiServices';

import type {
  BranchGeneratorsStatus,
  ChartFrequency,
  Co2EmissionData,
  CostAnalysisData,
  DieselOverviewState,
  DieselPriceData,
  FuelUsageSeriesPoint,
  GeneratorFuelSeriesDevice,
  GeneratorStatusChartData,
  OperationalEfficiencyData,
  TotalEnergyData,
} from './types';

function safeNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export async function fetchBranchGeneratorsStatus(
  branchId: number | string,
): Promise<BranchGeneratorsStatus> {
  const response = await APIService.get(`branch/${branchId}/generators-status/`);
  const data = response.data as BranchGeneratorsStatus;
  return {
    generators: asArray(data?.generators),
  };
}

export async function fetchCo2Emission(
  branchId: number | string,
  month: number,
  year: number,
): Promise<Co2EmissionData> {
  const response = await APIService.get(
    `branch/${branchId}/generators-co2/?month=${month}&year=${year}`,
  );
  const payload = response.data as { data?: Co2EmissionData } | Co2EmissionData;
  const data = 'data' in payload && payload.data ? payload.data : payload;
  return {
    total_co2_tonnes: safeNumber(
      (data as Co2EmissionData)?.total_co2_tonnes ?? (payload as { total_co2_tonnes?: number }).total_co2_tonnes,
    ),
  };
}

export async function fetchDieselPrice(
  branchId: number | string,
): Promise<DieselPriceData> {
  const response = await APIService.get(`branch/${branchId}/diesel-price/`);
  const payload = response.data as { data?: DieselPriceData } | DieselPriceData;
  const data = (
    'data' in payload && payload.data ? payload.data : payload
  ) as DieselPriceData;

  return {
    diesel_price_per_litre: safeNumber(data.diesel_price_per_litre),
    diesel_efficiency: safeNumber(data.diesel_efficiency),
    month_estimated_cost: safeNumber(data.month_estimated_cost),
  };
}

export async function fetchTotalEnergyUsed(
  branchId: number | string,
  month: number,
  year: number,
): Promise<TotalEnergyData> {
  const response = await APIService.get(
    `branch/${branchId}/generators-monthly-energy/?month=${month}&year=${year}`,
  );
  const data = response.data as TotalEnergyData;

  return {
    total_energy: safeNumber(data?.total_energy),
    generators: asArray<TotalEnergyData['generators'][number]>(data?.generators).map(
      (generator) => ({
        name: String(generator.name || ''),
        energy: safeNumber(generator.energy),
      }),
    ),
  };
}

export async function fetchGeneratorStatusChart(
  branchId: number | string,
  month: number,
  year: number,
): Promise<GeneratorStatusChartData> {
  const response = await APIService.get(
    `branch/${branchId}/generator-runtime-fuel-usage/?month=${month}&year=${year}`,
  );
  const payload = response.data as { data?: GeneratorStatusChartData };
  const data = payload?.data || (response.data as GeneratorStatusChartData);

  return {
    total_runtime: String(data?.total_runtime || ''),
    total_fuel_liters: safeNumber(data?.total_fuel_liters),
    generators: asArray<GeneratorStatusChartData['generators'][number]>(data?.generators).map(
      (generator) => ({
        name: String(generator.name || ''),
        runtime_hours: safeNumber(generator.runtime_hours),
        runtime_formatted: String(generator.runtime_formatted || ''),
        fuel_liters: safeNumber(generator.fuel_liters),
      }),
    ),
  };
}

export async function fetchGeneratorFuelSeries(
  branchId: number | string,
  month: number,
  year: number,
  frequency: ChartFrequency = 'daily',
): Promise<GeneratorFuelSeriesDevice[]> {
  const response = await APIService.get(
    `branch/${branchId}/generator-energy-fuel-series/?month=${month}&year=${year}&frequency=${frequency}`,
  );
  const payload = response.data as { data?: GeneratorFuelSeriesDevice[] };
  const devices = payload?.data || (response.data as GeneratorFuelSeriesDevice[]);

  return asArray<GeneratorFuelSeriesDevice>(devices).map((device) => ({
    device_id: device.device_id,
    name: String(device.name || ''),
    series: asArray<GeneratorFuelSeriesDevice['series'][number]>(device.series).map(
      (point) => ({
        date: String(point.date || ''),
        kwh: safeNumber(point.kwh),
        fuel_liters: safeNumber(point.fuel_liters),
      }),
    ),
  }));
}

export async function fetchFuelUsageSeries(
  branchId: number | string,
  month: number,
  year: number,
  frequency: ChartFrequency = 'daily',
): Promise<FuelUsageSeriesPoint[]> {
  const response = await APIService.get(
    `branch/${branchId}/fuel-usage-series/?month=${month}&year=${year}&frequency=${frequency}`,
  );
  const payload = response.data as { data?: { series?: FuelUsageSeriesPoint[] } };
  const series =
    payload?.data?.series ||
    (response.data as { series?: FuelUsageSeriesPoint[] })?.series ||
    [];

  return asArray<FuelUsageSeriesPoint>(series).map((point) => ({
    date: String(point.date || ''),
    fuel_liters: safeNumber(point.fuel_liters),
    predicted_liters: safeNumber(point.predicted_liters),
  }));
}

export async function fetchOperationalEfficiency(
  branchId: number | string,
  month: number,
  year: number,
): Promise<OperationalEfficiencyData> {
  const response = await APIService.get(
    `branch/${branchId}/generator-metrics/?month=${month}&year=${year}`,
  );
  const payload = response.data as { data?: OperationalEfficiencyData };
  const data = payload?.data || (response.data as OperationalEfficiencyData);

  return {
    fuel_efficiency: { value: safeNumber(data?.fuel_efficiency?.value) },
    fuel_consumption: { value: safeNumber(data?.fuel_consumption?.value) },
    power_demand_kva: {
      max: { value: safeNumber(data?.power_demand_kva?.max?.value) },
      avg: { value: safeNumber(data?.power_demand_kva?.avg?.value) },
      min: { value: safeNumber(data?.power_demand_kva?.min?.value) },
    },
    generator_efficiency_score: {
      value: safeNumber(data?.generator_efficiency_score?.value),
    },
  };
}

export async function fetchCostAnalysis(
  branchId: number | string,
  month: number,
  year: number,
): Promise<CostAnalysisData> {
  const response = await APIService.get(
    `branch/${branchId}/cost-metrics/?month=${month}&year=${year}`,
  );
  const payload = response.data as { data?: CostAnalysisData };
  const data = payload?.data || (response.data as CostAnalysisData);

  return {
    total_cost: { value: safeNumber(data?.total_cost?.value) },
    blended_cost: { value: safeNumber(data?.blended_cost?.value) },
    annual_cost_forecast: { value: safeNumber(data?.annual_cost_forecast?.value) },
  };
}

export async function fetchDieselOverview(
  branchId: number | string,
  month: number,
  year: number,
  fuelBreakupFrequency: ChartFrequency = 'daily',
  fuelUsageFrequency: ChartFrequency = 'daily',
): Promise<DieselOverviewState> {
  const [
    branchStatus,
    co2,
    dieselPrice,
    totalEnergy,
    generatorStatusChart,
    generatorFuelSeries,
    fuelUsageSeries,
    operationalEfficiency,
    costAnalysis,
  ] = await Promise.all([
    fetchBranchGeneratorsStatus(branchId),
    fetchCo2Emission(branchId, month, year),
    fetchDieselPrice(branchId),
    fetchTotalEnergyUsed(branchId, month, year),
    fetchGeneratorStatusChart(branchId, month, year),
    fetchGeneratorFuelSeries(branchId, month, year, fuelBreakupFrequency),
    fetchFuelUsageSeries(branchId, month, year, fuelUsageFrequency),
    fetchOperationalEfficiency(branchId, month, year),
    fetchCostAnalysis(branchId, month, year),
  ]);

  return {
    branchStatus,
    co2,
    dieselPrice,
    totalEnergy,
    generatorStatusChart,
    generatorFuelSeries,
    fuelUsageSeries,
    operationalEfficiency,
    costAnalysis,
  };
}
