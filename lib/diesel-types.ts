export type DieselGeneratorStatus = {
  name: string;
  is_currently_on?: boolean;
  last_usage_time_relative?: string;
};

export type DieselPrice = {
  diesel_price_per_litre?: number;
  diesel_efficiency?: number;
  month_estimated_cost?: number;
};

export type DieselEnergyGenerator = {
  name: string;
  energy?: number;
};

export type DieselRuntimeGenerator = {
  name: string;
  runtime_hours?: number;
  runtime_formatted?: string;
  fuel_liters?: number;
};

export type DieselFuelPoint = {
  date: string;
  fuel_liters?: number;
  predicted_liters?: number;
};

export type DieselOverviewData = {
  generators: DieselGeneratorStatus[];
  price: DieselPrice;
  co2Tonnes: number;
  totalEnergy: number;
  energyGenerators: DieselEnergyGenerator[];
  runtimeGenerators: DieselRuntimeGenerator[];
  totalRuntime?: string | number;
  totalFuelLiters?: number;
};

export type DieselDetailsData = {
  fuelSeries: DieselFuelPoint[];
  fuelEfficiency?: number;
  specificConsumption?: number;
  efficiencyScore?: number;
  totalCost?: number;
  blendedCost?: number;
  annualCost?: number;
};
