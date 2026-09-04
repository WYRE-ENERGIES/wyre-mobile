export type YieldPeriod = {
  kwh: number;
  cost: number;
};

export type YieldTab = {
  total: YieldPeriod;
  today: YieldPeriod;
  monthly: YieldPeriod;
};

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
  generation: YieldTab;
  battery: YieldTab;
  load: YieldTab;
  grid: YieldTab;
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

export const YIELD_PERIOD_LABELS: Record<YieldTabKey, Record<keyof YieldTab, string>> = {
  generation: {
    total: 'Total Yield',
    today: "Today's yield",
    monthly: "Current Month's yield",
  },
  battery: {
    total: 'Total',
    today: 'Today',
    monthly: 'Current Month',
  },
  load: {
    total: 'Consumption',
    today: "Today's Energy",
    monthly: 'Current Month',
  },
  grid: {
    total: 'Import',
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
