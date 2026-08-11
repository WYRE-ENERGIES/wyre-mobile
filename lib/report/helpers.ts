import {
  MONTH_NAMES,
  SOURCE_COLORS,
  type MonthlyReportModel,
  type ReportContext,
  type ReportType,
} from '@/lib/report/types';

export function getPreviousMonth(now = new Date()): { month: number; year: number } {
  const date = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return {
    month: date.getMonth() + 1,
    year: date.getFullYear(),
  };
}

export function isReportReadyToSend(context: ReportContext | null): boolean {
  if (!context?.branch_id) return false;

  switch (context.report_type) {
    case 'daily':
      return Boolean(context.date);
    case 'periodic':
      return Boolean(context.start_date && context.end_date);
    case 'monthly':
      return Boolean(context.month && context.year);
    default:
      return false;
  }
}

export function buildReportContext(params: {
  reportType: ReportType;
  branchId: number | string | null | undefined;
  date: string;
  startDate: string;
  endDate: string;
  month: number;
  year: number;
}): ReportContext | null {
  const { reportType, branchId, date, startDate, endDate, month, year } = params;
  if (!branchId) return null;

  if (reportType === 'daily' && date) {
    return { report_type: 'daily', branch_id: branchId, date };
  }

  if (reportType === 'periodic' && startDate && endDate) {
    return {
      report_type: 'periodic',
      branch_id: branchId,
      start_date: startDate,
      end_date: endDate,
    };
  }

  if (reportType === 'monthly' && month && year) {
    return {
      report_type: 'monthly',
      branch_id: branchId,
      month,
      year,
    };
  }

  return null;
}

export function formatKwh(value: number): string {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 1,
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
  });
}

export function monthLabel(month: number): string {
  return MONTH_NAMES[month - 1] ?? String(month);
}

export function withSourcePercents(sources: MonthlyReportModel['sources']) {
  const total = sources.reduce((sum, item) => sum + item.valueKwh, 0);
  return sources.map((item) => ({
    ...item,
    percent: total === 0 ? 0 : (item.valueKwh / total) * 100,
  }));
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDisplayDate(value: string): string {
  const date = parseISODate(value);
  if (!date) return 'Select date';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Full sample Actual Report used when live API is unavailable. */
export const DUMMY_MONTHLY_REPORT: MonthlyReportModel = {
  branchName: 'Polaris Agodi',
  monthLabel: 'June',
  year: 2026,
  totalEnergyKwh: 9729.6,
  sources: [
    { label: 'UTILITY', valueKwh: 638.4, color: SOURCE_COLORS.utility },
    { label: 'GEN 65kVA', valueKwh: 0, color: SOURCE_COLORS.genYellow },
    { label: 'GEN 275kVA', valueKwh: 9091.2, color: SOURCE_COLORS.genCyan },
    { label: 'GEN 500kVA (OLD)', valueKwh: 0, color: SOURCE_COLORS.genIndigo },
  ],
  utilityRows: [
    {
      key: 'u1',
      month: 'June',
      energy: '638.4',
      timeOfUse: '120',
      bill: '185,000',
      accuracy: '96.2',
      actualCost: '178,400',
      actualEnergy: '620',
      usageAccuracy: '97%',
    },
  ],
  dieselRows: [
    {
      key: 'd1',
      month: 'June',
      name: 'GEN 275kVA',
      energy: '9,091.2',
      dieselUsage: '2,450',
      timeOfUse: '310',
      actualCost: '2,940,000',
      optimalCost: '2,610,000',
      accuracy: '88.8',
    },
  ],
  solarHourKwh: 2140,
  solarHourUnit: 'kWh',
  powerDemand: [
    {
      label: 'Operational',
      peak: '185',
      average: '92',
      minimum: '41',
      totalEnergy: '5,820',
      unit: 'kW',
      color: SOURCE_COLORS.utility,
    },
    {
      label: 'Non-Operational',
      peak: '64',
      average: '28',
      minimum: '12',
      totalEnergy: '1,540',
      unit: 'kW',
      color: SOURCE_COLORS.genYellow,
    },
    {
      label: 'Weekends',
      peak: '110',
      average: '55',
      minimum: '20',
      totalEnergy: '2,369.6',
      unit: 'kW',
      color: SOURCE_COLORS.genBlue,
    },
  ],
  usageBreakdown: [
    { key: '1', name: 'Operational Period', value: '5,820', percentage: '59.8' },
    { key: '2', name: 'Non-Operational Period', value: '1,540', percentage: '15.8' },
    { key: '3', name: 'Weekend Period', value: '2,369.6', percentage: '24.4' },
  ],
  deviationRows: [
    {
      key: 'dev1',
      month: 'June',
      value: '420',
      deviationTimeOfUse: '18',
      dieselConsumption: '95',
      deviationCost: '114,000',
    },
  ],
  currentEfficiency: {
    label: 'June Month Efficiency',
    value: '84.2',
    unit: '%',
    delta: '+2.40%',
  },
  bestEfficiency: {
    label: 'Best Ever Efficiency',
    value: '92.0',
    unit: '%',
    achievedDate: 'April 2025',
  },
  fuelAccuracy: '91.5%',
  fuelRecommended: '3.4 kWh/liter',
  fuelAchieved: '3.6 kWh/liter',
  bandRows: [
    { key: 'a', band: 'A', totalHours: '540', expectedHours: '620' },
    { key: 'b', band: 'B', totalHours: '120', expectedHours: '80' },
    { key: 'c', band: 'C', totalHours: '40', expectedHours: '20' },
    { key: 'd', band: 'D', totalHours: '20', expectedHours: '0' },
  ],
  bandLabel: 'A',
  dataEntryScore: '87',
  dataEntryUnit: '%',
};
