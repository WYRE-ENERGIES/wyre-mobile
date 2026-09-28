export type YieldPeriodKey = 'today' | 'monthly' | 'total';

export type EnergyYieldPeriod = {
  kwh: number;
  cost: number;
  period_label?: string;
};

export type BatteryYieldPeriod = {
  charge_kwh: number;
  charge_cost: number;
  discharge_kwh: number;
  discharge_cost: number;
  period_label?: string;
};

export type EnergyYieldTab = Record<YieldPeriodKey, EnergyYieldPeriod>;
export type BatteryYieldTab = Record<YieldPeriodKey, BatteryYieldPeriod>;

export type SolarOverview = {
  weather: {
    city: string;
    condition: string;
    temperature_c: number;
    sunshine: string;
  };
  metrics: {
    pv_production_kw: number;
    installed_capacity_kWp: number;
    percentage_usage: number;
  };
};

export type SolarYield = {
  branch_id?: number;
  as_of?: string;
  blended_cost?: number;
  generation: EnergyYieldTab;
  battery: BatteryYieldTab;
  load: EnergyYieldTab;
  grid: EnergyYieldTab;
};

export type SiteNode = {
  kw: number;
  direction?: 'IN' | 'OUT' | 'IDLE';
  percentage?: number;
  status?: 'ON' | 'OFF';
  installed_capacity_kwp?: number;
};

export type SolarSiteStatus = {
  pv: SiteNode;
  battery: SiteNode;
  grid: SiteNode;
  load: SiteNode;
  generator_power?: SiteNode;
};

export type YieldTabKey = 'generation' | 'battery' | 'load' | 'grid';

export const YIELD_TABS: { key: YieldTabKey; label: string }[] = [
  { key: 'generation', label: 'Generation' },
  { key: 'battery', label: 'Battery' },
  { key: 'load', label: 'Load' },
  { key: 'grid', label: 'Grid' },
];

export const YIELD_PERIOD_KEYS: YieldPeriodKey[] = ['today', 'monthly', 'total'];

export const YIELD_PERIOD_LABELS: Record<YieldTabKey, Record<YieldPeriodKey, string>> = {
  generation: {
    total: 'All time yield',
    today: "Today's yield",
    monthly: "Current Month's yield",
  },
  battery: {
    total: 'All time',
    today: 'Today',
    monthly: 'Current Month',
  },
  load: {
    total: 'All time consumption',
    today: "Today's Energy",
    monthly: 'Current Month',
  },
  grid: {
    total: 'All time import',
    today: "Today's Energy",
    monthly: 'Current Month',
  },
};

export type SolarHourlyPoint = {
  hour_label: string;
  pv_kw?: number;
  grid_kw?: number;
  load_kw?: number;
  backup_load_kwh?: number;
  battery_charge_kwh?: number;
  battery_discharge_kwh?: number;
};

export type SolarHourlyChart = {
  hours: SolarHourlyPoint[];
};
