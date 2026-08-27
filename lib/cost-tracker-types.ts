export type DieselPurchase = {
  id: number;
  date: string;
  quantity: number;
  price_per_litre: number;
};

export type UtilityPurchase = {
  id: number;
  date: string;
  value: number;
  tarrif: number;
  amount: number;
  vat_inclusive_amount: number;
};

export type IppPurchase = {
  id: number;
  date: string;
  value: number;
  tarrif: number;
  amount: number;
  vat_inclusive_amount: number;
};

export type CostTrackerBranchOverview = {
  branch_name?: string;
  branch_data?: {
    diesel?: DieselPurchase[];
    utility?: UtilityPurchase[];
    ipp?: IppPurchase[];
  };
};

export type DieselOverviewRow = {
  month: string;
  inputted_usage: number;
  forecasted_usage: number;
  inputted_cost: number;
  forecasted_cost: number;
  diesel_difference: number;
  cost_difference: number;
  percentage_usage: number;
};

export type UtilityOverviewRow = {
  month: string;
  purchased_kwh: number;
  energy_consumed_kwh: number;
  purchased_naira: number;
  energy_consumed_naira: number;
  difference_kwh: number;
  difference_naira: number;
  percentage: number;
};

export type BaselinePoint = {
  date: string;
  forecast: number;
  used: number;
};

export type CostTrackerBaseline = {
  branch_name?: string;
  baseline?: Record<string, BaselinePoint[]>;
};

export type DieselDailyEntry = {
  fuel_consumption_id: number;
  date: string;
  quantity: number;
  hours_of_use: number;
  energy_consumed?: Record<string, number>;
  litres_per_hour?: Record<string, number>;
};

export type CostTrackerDashboard = {
  overview: CostTrackerBranchOverview;
  dieselOverview: DieselOverviewRow[];
  utilityOverview: UtilityOverviewRow[];
  baseline: CostTrackerBaseline;
};
