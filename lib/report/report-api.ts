import { APIService } from '@/config/api/apiServices';
import { monthLabel } from '@/lib/report/helpers';
import type {
  DieselRow,
  MonthlyReportModel,
  ReportContext,
  UtilityRow,
} from '@/lib/report/types';
import { SOURCE_COLORS } from '@/lib/report/types';

type PreviewResponse = {
  html_email?: string;
  data?: { html_email?: string };
};

function toQuery(context: ReportContext): string {
  return new URLSearchParams(
    Object.entries(context).reduce<Record<string, string>>((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = String(value);
      }
      return acc;
    }, {}),
  ).toString();
}

export async function previewReportHtml(context: ReportContext): Promise<string> {
  const response = await APIService.get(`preview-report/?${toQuery(context)}`);
  const data = response.data as PreviewResponse;
  return data?.html_email || data?.data?.html_email || '';
}

export async function sendReportEmail(
  context: ReportContext,
  recipient: string,
): Promise<void> {
  await APIService.post('forward-report/', {
    ...context,
    recipient,
    carbon_copy: [],
  });
}

function safeNumber(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function formatDeviceName(name: string): string {
  return name.replace(/_/g, ' ');
}

function mapUtilityRows(data: Record<string, unknown>): UtilityRow[] {
  const energyGenerated = data.energy_generated as
    | {
        current_month?: { devices?: { utility?: Array<Record<string, unknown>> } };
        previous_month_1?: { devices?: { utility?: Array<Record<string, unknown>> } };
        previous_month_2?: { devices?: { utility?: Array<Record<string, unknown>> } };
      }
    | undefined;

  const buckets = [
    energyGenerated?.current_month?.devices?.utility || [],
    energyGenerated?.previous_month_1?.devices?.utility || [],
    energyGenerated?.previous_month_2?.devices?.utility || [],
  ];

  return buckets.flatMap((entries, bucketIndex) =>
    entries.map((device, index) => ({
      key: `u_${bucketIndex}_${index}`,
      month: String(device.month || ''),
      energy: safeNumber(String(device.device_energy || '').split(' ')[0]).toLocaleString(),
      timeOfUse: safeNumber(device.time_of_use).toLocaleString(),
      bill: safeNumber(device.expected_bill).toLocaleString(),
      accuracy: safeNumber(device.last_bill_accuracy).toFixed(1),
      actualCost: safeNumber(device.actual_cost).toLocaleString(),
      actualEnergy: String(device.actual_energy || '0'),
      usageAccuracy: String(device.usage_accuracy || '0%'),
    })),
  );
}

function mapDieselRows(data: Record<string, unknown>): DieselRow[] {
  const energyGenerated = data.energy_generated as
    | {
        current_month?: {
          devices?: { generator?: { entries?: Array<Record<string, unknown>> } };
        };
        previous_month_1?: {
          devices?: { generator?: { entries?: Array<Record<string, unknown>> } };
        };
        previous_month_2?: {
          devices?: { generator?: { entries?: Array<Record<string, unknown>> } };
        };
      }
    | undefined;

  const entries = [
    ...(energyGenerated?.current_month?.devices?.generator?.entries || []),
    ...(energyGenerated?.previous_month_1?.devices?.generator?.entries || []),
    ...(energyGenerated?.previous_month_2?.devices?.generator?.entries || []),
  ];

  return entries.map((entry, index) => ({
    key: `d_${index}`,
    month: String(entry.month || ''),
    name: formatDeviceName(String(entry.name || `Generator ${index + 1}`)),
    energy: safeNumber(String(entry.device_energy || '').split(' ')[0]).toLocaleString(),
    dieselUsage: safeNumber(String(entry.optimal_usage || '').split(' ')[0]).toLocaleString(),
    timeOfUse: safeNumber(entry.time_of_use).toLocaleString(),
    actualCost: safeNumber(entry.actual_cost).toLocaleString(),
    optimalCost: safeNumber(entry.optimal_cost).toLocaleString(),
    accuracy: safeNumber(entry.last_bill_accuracy).toFixed(2),
  }));
}

function resolveBandLabel(totalHours: number): string {
  if (totalHours > 540) return 'A';
  if (totalHours > 432) return 'B';
  if (totalHours > 324) return 'C';
  if (totalHours > 216) return 'D';
  return 'E';
}

export function mapGenerateReportToMonthlyModel(
  data: Record<string, unknown>,
  fallbackMonth?: number,
  fallbackYear?: number,
): MonthlyReportModel {
  const branchName =
    (typeof data.branch_name === 'string' && data.branch_name) || 'Branch';
  const monthRaw = typeof data.month === 'string' ? data.month : '';
  const year = safeNumber(data.year) || fallbackYear || new Date().getFullYear();

  const totalEnergy = data.total_energy as { value?: unknown; unit?: string } | undefined;
  const totalEnergyKwh = safeNumber(totalEnergy?.value);

  const solarHour = data.solar_hour as { value?: unknown; unit?: string } | undefined;

  const energyGenerated = data.energy_generated as
    | {
        current_month?: {
          devices?: {
            utility?: Array<{ device_energy?: string; name?: string }>;
            generator?: {
              entries?: Array<{ device_energy?: string; name?: string }>;
            };
          };
        };
      }
    | undefined;

  const utilityEntries = energyGenerated?.current_month?.devices?.utility || [];
  const generatorEntries =
    energyGenerated?.current_month?.devices?.generator?.entries || [];

  const utilityTotal = utilityEntries.reduce(
    (sum, device) => sum + safeNumber((device.device_energy || '').split(' ')[0]),
    0,
  );

  const generatorColors = [
    SOURCE_COLORS.genYellow,
    SOURCE_COLORS.genCyan,
    SOURCE_COLORS.genIndigo,
    SOURCE_COLORS.genBlue,
    SOURCE_COLORS.genGray,
  ];

  const sources = [
    { label: 'UTILITY', valueKwh: utilityTotal, color: SOURCE_COLORS.utility },
    ...generatorEntries.map((entry, index) => ({
      label: formatDeviceName(entry.name || `GEN ${index + 1}`).toUpperCase(),
      valueKwh: safeNumber((entry.device_energy || '').split(' ')[0]),
      color: generatorColors[index % generatorColors.length],
    })),
  ];

  const powerDemand = data.power_demand as
    | Record<string, { peak?: unknown; average?: unknown; minimum?: unknown; total_energy?: unknown; unit?: string }>
    | undefined;

  const operational = powerDemand?.operational;
  const nonOperational = powerDemand?.non_operational;
  const weekends = powerDemand?.weekends;

  const operationalEnergy = safeNumber(operational?.total_energy);
  const nonOperationalEnergy = safeNumber(nonOperational?.total_energy);
  const weekendEnergy = safeNumber(weekends?.total_energy);
  const demandTotal = operationalEnergy + nonOperationalEnergy + weekendEnergy;

  const deviation = data.energy_deviation_and_cost as
    | Record<string, Record<string, unknown>>
    | undefined;

  const efficiency = data.generator_size_efficiency as
    | {
        current_month?: { value?: unknown; unit?: string; date?: string };
        previous_month?: { value?: unknown; unit?: string };
        best_month?: { value?: unknown; unit?: string; date?: string };
      }
    | undefined;

  const fuel = data.fuel_efficiency_accuracy_comparison as
    | {
        accuracy?: { value?: unknown; unit?: string };
        recommended?: { value?: unknown; unit?: string };
        achieved?: { value?: unknown; unit?: string };
      }
    | undefined;

  const bands = (data.utility_band_categorization as Array<Record<string, unknown>>) || [];
  const firstBandHours = safeNumber(bands[0]?.total_hours);

  const dataEntry = data.data_entry as { value?: unknown; unit?: string } | undefined;

  const currentEff = safeNumber(efficiency?.current_month?.value);
  const previousEff = safeNumber(efficiency?.previous_month?.value);
  const delta = currentEff - previousEff;

  return {
    branchName,
    monthLabel: monthRaw
      ? monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1)
      : monthLabel(fallbackMonth || 1),
    year,
    totalEnergyKwh,
    sources,
    utilityRows: mapUtilityRows(data),
    dieselRows: mapDieselRows(data),
    solarHourKwh: safeNumber(solarHour?.value),
    solarHourUnit: solarHour?.unit || 'kWh',
    powerDemand: [
      {
        label: 'Operational',
        peak: String(operational?.peak ?? '0'),
        average: String(operational?.average ?? '0'),
        minimum: String(operational?.minimum ?? '0'),
        totalEnergy: operationalEnergy.toLocaleString(),
        unit: operational?.unit || 'kW',
        color: SOURCE_COLORS.utility,
      },
      {
        label: 'Non-Operational',
        peak: String(nonOperational?.peak ?? '0'),
        average: String(nonOperational?.average ?? '0'),
        minimum: String(nonOperational?.minimum ?? '0'),
        totalEnergy: nonOperationalEnergy.toLocaleString(),
        unit: nonOperational?.unit || 'kW',
        color: SOURCE_COLORS.genYellow,
      },
      {
        label: 'Weekends',
        peak: String(weekends?.peak ?? '0'),
        average: String(weekends?.average ?? '0'),
        minimum: String(weekends?.minimum ?? '0'),
        totalEnergy: weekendEnergy.toLocaleString(),
        unit: weekends?.unit || 'kW',
        color: SOURCE_COLORS.genBlue,
      },
    ],
    usageBreakdown: [
      {
        key: '1',
        name: 'Operational Period',
        value: operationalEnergy.toLocaleString(),
        percentage: demandTotal === 0 ? '0.0' : ((operationalEnergy / demandTotal) * 100).toFixed(1),
      },
      {
        key: '2',
        name: 'Non-Operational Period',
        value: nonOperationalEnergy.toLocaleString(),
        percentage:
          demandTotal === 0 ? '0.0' : ((nonOperationalEnergy / demandTotal) * 100).toFixed(1),
      },
      {
        key: '3',
        name: 'Weekend Period',
        value: weekendEnergy.toLocaleString(),
        percentage: demandTotal === 0 ? '0.0' : ((weekendEnergy / demandTotal) * 100).toFixed(1),
      },
    ],
    deviationRows: ['current_month', 'previous_month_1', 'previous_month_2']
      .map((key, index) => {
        const row = deviation?.[key];
        if (!row) return null;
        return {
          key: `dev_${index}`,
          month: String(row.month || key.replace(/_/g, ' ')),
          value: safeNumber(row.value).toLocaleString(),
          deviationTimeOfUse: safeNumber(row.deviation_time_of_use).toLocaleString(),
          dieselConsumption: safeNumber(row.diesel_consumption).toLocaleString(),
          deviationCost: safeNumber(row.deviation_cost).toLocaleString(),
        };
      })
      .filter(Boolean) as MonthlyReportModel['deviationRows'],
    currentEfficiency: {
      label: `${monthRaw || 'Current'} Month Efficiency`,
      value: String(efficiency?.current_month?.value ?? '0'),
      unit: efficiency?.current_month?.unit || '%',
      delta: `${delta >= 0 ? '+' : '-'}${Math.abs(delta).toFixed(2)}${
        efficiency?.previous_month?.unit || '%'
      }`,
    },
    bestEfficiency: {
      label: 'Best Ever Efficiency',
      value: String(efficiency?.best_month?.value ?? '0'),
      unit: efficiency?.best_month?.unit || '%',
      achievedDate: efficiency?.best_month?.date
        ? String(efficiency.best_month.date)
        : undefined,
    },
    fuelAccuracy: `${fuel?.accuracy?.value ?? '0'}${fuel?.accuracy?.unit || '%'}`,
    fuelRecommended: `${fuel?.recommended?.value ?? '0'} ${fuel?.recommended?.unit || ''}`.trim(),
    fuelAchieved: `${fuel?.achieved?.value ?? '0'} ${fuel?.achieved?.unit || ''}`.trim(),
    bandRows: bands.map((band, index) => ({
      key: `band_${index}`,
      band: String(band.band || ''),
      totalHours: String(band.total_hours || '0'),
      expectedHours: String(band.expected_hours || '0'),
    })),
    bandLabel: resolveBandLabel(firstBandHours),
    dataEntryScore: String(dataEntry?.value ?? '0'),
    dataEntryUnit: dataEntry?.unit || '%',
  };
}

export async function fetchMonthlyReportData(
  branchId: number | string,
  month: number,
  year: number,
): Promise<MonthlyReportModel> {
  const response = await APIService.get(
    `generate-report/?branch_id=${branchId}&month=${month}&year=${year}`,
  );
  return mapGenerateReportToMonthlyModel(
    response.data as Record<string, unknown>,
    month,
    year,
  );
}
