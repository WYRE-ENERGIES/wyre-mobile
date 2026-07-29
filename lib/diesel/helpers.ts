import { MONTH_NAMES } from '@/lib/report/types';

import type {
  BranchGeneratorsStatus,
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

export const GEN_COLORS = ['#5C12A7', '#FCCC43', '#52AC0B', '#FF6B6B'] as const;

export function getMonthYear(date = new Date()): { month: number; year: number } {
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export function monthLabel(month: number, year: number): string {
  const name = MONTH_NAMES[month - 1] || 'Month';
  return `${name} ${year}`;
}

export function formatNaira(value: number | null | undefined): string {
  const num = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return `₦ ${num.toLocaleString()}`;
}

export function formatNumber(
  value: number | null | undefined,
  options?: { maximumFractionDigits?: number },
): string {
  const num = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return num.toLocaleString(undefined, {
    maximumFractionDigits: options?.maximumFractionDigits ?? 2,
  });
}

export function buildMonthOptions(now = new Date()) {
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  return MONTH_NAMES.map((label, index) => {
    const value = index + 1;
    return {
      value,
      label,
      disabled: false,
    };
  }).filter((option) => {
    // Only used when combined with year picker; filtering happens in page.
    return option;
  });
}

export function buildYearOptions(now = new Date(), span = 5): number[] {
  const currentYear = now.getFullYear();
  return Array.from({ length: span }, (_, index) => currentYear - index);
}

export function formatChartDateLabel(
  isoDate: string,
  frequency: 'daily' | 'monthly' = 'daily',
): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return isoDate;

  const month = date.toLocaleString('en-US', { month: 'short' });
  if (frequency === 'monthly') {
    return `${month} ${date.getFullYear()}`;
  }
  return `${month} ${date.getDate()}`;
}

export function isFutureMonth(month: number, year: number, now = new Date()): boolean {
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  if (year > currentYear) return true;
  if (year === currentYear && month > currentMonth) return true;
  return false;
}

function buildDailyDates(year: number, month: number, count = 12): string[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const step = Math.max(1, Math.floor(daysInMonth / count));
  const dates: string[] = [];

  for (let day = 1; day <= daysInMonth; day += step) {
    dates.push(
      `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
    );
  }

  return dates;
}

export const DUMMY_DIESEL_OVERVIEW: DieselOverviewState = {
  branchStatus: {
    generators: [
      {
        name: 'Gen_275KVA',
        is_currently_on: false,
        last_usage_time_relative: '43 minutes ago',
      },
      {
        name: 'GEN 65KVA',
        is_currently_on: false,
        last_usage_time_relative: '2 hours ago',
      },
      {
        name: 'GEN 500KVA',
        is_currently_on: false,
        last_usage_time_relative: '1 day ago',
      },
    ],
  },
  co2: {
    total_co2_tonnes: 2.06,
  },
  dieselPrice: {
    diesel_price_per_litre: 0,
    diesel_efficiency: 42,
    month_estimated_cost: 0,
  },
  totalEnergy: {
    total_energy: 7690,
    generators: [
      { name: 'GEN 65KVA', energy: 2100 },
      { name: 'Gen 275KVA', energy: 3240 },
      { name: 'GEN 500KVA', energy: 2350 },
    ],
  },
  generatorStatusChart: {
    total_runtime: '12h 15m 08s',
    total_fuel_liters: 2188.23,
    generators: [
      {
        name: 'GEN 65KVA',
        runtime_hours: 2.5,
        runtime_formatted: '02h 30m 12s',
        fuel_liters: 420.5,
      },
      {
        name: 'Gen 275KVA',
        runtime_hours: 4.68,
        runtime_formatted: '04h 40m 32s',
        fuel_liters: 1188.23,
      },
      {
        name: 'GEN 500KVA',
        runtime_hours: 5.08,
        runtime_formatted: '05h 04m 24s',
        fuel_liters: 579.5,
      },
    ],
  },
  generatorFuelSeries: buildDummyGeneratorFuelSeries(2024, 7),
  fuelUsageSeries: buildDummyFuelUsageSeries(2024, 7),
  operationalEfficiency: {
    fuel_efficiency: { value: 0 },
    fuel_consumption: { value: 0 },
    power_demand_kva: {
      max: { value: 37.83 },
      avg: { value: 18.42 },
      min: { value: 4.12 },
    },
    generator_efficiency_score: { value: 0 },
  },
  costAnalysis: {
    total_cost: { value: 0 },
    blended_cost: { value: 0 },
    annual_cost_forecast: { value: 0 },
  },
};

function buildDummyGeneratorFuelSeries(
  year: number,
  month: number,
): GeneratorFuelSeriesDevice[] {
  const dates = buildDailyDates(year, month, 10);
  const devices = [
    { name: 'GEN 65KVA', base: 180 },
    { name: 'Gen 275KVA', base: 260 },
    { name: 'GEN 500KVA', base: 220 },
  ];

  return devices.map((device, deviceIndex) => ({
    name: device.name,
    device_id: deviceIndex + 1,
    series: dates.map((date, index) => ({
      date,
      kwh: device.base + ((index + deviceIndex) % 5) * 35,
      fuel_liters: 40 + ((index + deviceIndex) % 4) * 12,
    })),
  }));
}

function buildDummyFuelUsageSeries(year: number, month: number): FuelUsageSeriesPoint[] {
  return buildDailyDates(year, month, 10).map((date, index) => ({
    date,
    fuel_liters: 80 + (index % 5) * 18,
    predicted_liters: 95 + (index % 4) * 16,
  }));
}
