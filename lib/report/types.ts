export type ReportType = 'daily' | 'periodic' | 'monthly';

export type ReportContext = {
  report_type: ReportType;
  branch_id: number | string;
  date?: string;
  start_date?: string;
  end_date?: string;
  month?: number;
  year?: number;
};

export type EnergySourceSlice = {
  label: string;
  valueKwh: number;
  color: string;
};

export type UtilityRow = {
  key: string;
  month: string;
  energy: string;
  timeOfUse: string;
  bill: string;
  accuracy: string;
  actualCost: string;
  actualEnergy: string;
  usageAccuracy: string;
};

export type DieselRow = {
  key: string;
  month: string;
  name: string;
  energy: string;
  dieselUsage: string;
  timeOfUse: string;
  actualCost: string;
  optimalCost: string;
  accuracy: string;
};

export type PowerDemandPeriod = {
  label: string;
  peak: string;
  average: string;
  minimum: string;
  totalEnergy: string;
  unit: string;
  color: string;
};

export type UsageBreakdownRow = {
  key: string;
  name: string;
  value: string;
  percentage: string;
};

export type DeviationRow = {
  key: string;
  month: string;
  value: string;
  deviationTimeOfUse: string;
  dieselConsumption: string;
  deviationCost: string;
};

export type EfficiencyBlock = {
  label: string;
  value: string;
  unit: string;
  delta?: string;
  achievedDate?: string;
};

export type MonthlyReportModel = {
  branchName: string;
  monthLabel: string;
  year: number;
  totalEnergyKwh: number;
  sources: EnergySourceSlice[];
  utilityRows: UtilityRow[];
  dieselRows: DieselRow[];
  solarHourKwh: number;
  solarHourUnit: string;
  powerDemand: PowerDemandPeriod[];
  usageBreakdown: UsageBreakdownRow[];
  deviationRows: DeviationRow[];
  currentEfficiency: EfficiencyBlock;
  bestEfficiency: EfficiencyBlock;
  fuelAccuracy: string;
  fuelRecommended: string;
  fuelAchieved: string;
  bandRows: Array<{ key: string; band: string; totalHours: string; expectedHours: string }>;
  bandLabel: string;
  dataEntryScore: string;
  dataEntryUnit: string;
};

export const SOURCE_COLORS = {
  utility: '#9640FF',
  genYellow: '#F9CF40',
  genCyan: '#34D5FD',
  genIndigo: '#666fff',
  genBlue: '#4B8AFF',
  genGray: '#9CA3AF',
} as const;

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;
