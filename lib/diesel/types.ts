export type ChartFrequency = 'daily' | 'monthly';

export type GeneratorStatusItem = {
  name: string;
  is_currently_on?: boolean;
  last_usage_time_relative?: string;
};

export type BranchGeneratorsStatus = {
  generators: GeneratorStatusItem[];
};

export type Co2EmissionData = {
  total_co2_tonnes: number;
};

export type DieselPriceData = {
  diesel_price_per_litre: number;
  diesel_efficiency: number;
  month_estimated_cost: number;
};

export type GeneratorEnergyItem = {
  name: string;
  energy: number;
};

export type TotalEnergyData = {
  total_energy: number;
  generators: GeneratorEnergyItem[];
};

export type GeneratorStatusChartItem = {
  name: string;
  runtime_hours: number;
  runtime_formatted: string;
  fuel_liters: number;
};

export type GeneratorStatusChartData = {
  total_runtime: string;
  total_fuel_liters: number;
  generators: GeneratorStatusChartItem[];
};

export type SeriesPoint = {
  date: string;
  kwh?: number;
  fuel_liters?: number;
  fuel_liters_reported?: number;
  predicted_liters?: number;
};

export type GeneratorFuelSeriesDevice = {
  device_id?: string | number;
  name: string;
  series: SeriesPoint[];
};

export type FuelUsageSeriesPoint = {
  date: string;
  fuel_liters: number;
  predicted_liters: number;
};

export type FuelUsageSeriesData = {
  series: FuelUsageSeriesPoint[];
};

export type MetricValue = {
  value: number;
};

export type OperationalEfficiencyData = {
  fuel_efficiency: MetricValue;
  fuel_consumption: MetricValue;
  power_demand_kva: {
    max: MetricValue;
    avg: MetricValue;
    min: MetricValue;
  };
  generator_efficiency_score: MetricValue;
};

export type CostAnalysisData = {
  total_cost: MetricValue;
  blended_cost: MetricValue;
  annual_cost_forecast: MetricValue;
};

export type DieselOverviewState = {
  branchStatus: BranchGeneratorsStatus | null;
  co2: Co2EmissionData | null;
  dieselPrice: DieselPriceData | null;
  totalEnergy: TotalEnergyData | null;
  generatorStatusChart: GeneratorStatusChartData | null;
  generatorFuelSeries: GeneratorFuelSeriesDevice[];
  fuelUsageSeries: FuelUsageSeriesPoint[];
  operationalEfficiency: OperationalEfficiencyData | null;
  costAnalysis: CostAnalysisData | null;
};
