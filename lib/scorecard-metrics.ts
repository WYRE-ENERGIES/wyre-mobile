import { WyreColors } from '@/constants/theme';
import type { ScorecardChartSegment } from '@/lib/scorecard-chart';
import { buildDoughnutSegments } from '@/lib/scorecard-chart';

export type ScorecardTone = 'good' | 'warn' | 'bad' | 'neutral';

export type ScorecardStatus = {
  tone: ScorecardTone;
  label: string;
};

export const SCORECARD_TONE_COLORS: Record<ScorecardTone, string> = {
  good: WyreColors.success,
  warn: WyreColors.warning,
  bad: WyreColors.error,
  neutral: WyreColors.purple,
};

export function toneColor(tone: ScorecardTone): string {
  return SCORECARD_TONE_COLORS[tone];
}

/** Ranks tones so a multi-generator card can surface its worst reading. */
const TONE_SEVERITY: Record<ScorecardTone, number> = {
  neutral: 0,
  good: 1,
  warn: 2,
  bad: 3,
};

function worstTone(tones: ScorecardTone[]): ScorecardTone {
  return tones.reduce<ScorecardTone>(
    (worst, tone) => (TONE_SEVERITY[tone] > TONE_SEVERITY[worst] ? tone : worst),
    'neutral',
  );
}

export type ScorecardMetricRow = {
  label: string;
  value: string;
  accent?: string;
};

export type ScorecardChart = ScorecardChartSegment & {
  centerPrimary: string;
  centerSecondary?: string;
  accentColor?: string;
};

export type ScorecardGeneratorEntry = {
  key: string;
  chart: ScorecardChart;
  name: string;
  subtitle: string;
  detail?: string;
  status?: { message: string; color: string };
};

export type ScorecardMetric = {
  key: string;
  title: string;
  headline: string;
  headlineHint?: string;
  status?: ScorecardStatus;
  rows: ScorecardMetricRow[];
  chart?: ScorecardChart;
  generatorEntries?: ScorecardGeneratorEntry[];
  footerNote?: string;
  footer?: string;
};

type DeviceLike = {
  is_source?: boolean;
  is_generator?: boolean;
  score_card?: Record<string, unknown>;
  name?: string;
};

function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string' && value.trim() && !Number.isNaN(Number(value))) {
    return Number(value);
  }
  return null;
}

function formatNumber(value: number | null | undefined, digits = 1): string {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

function percent(used: number | null, total: number | null): string {
  if (used == null || total == null || total === 0) return '—';
  return `${Math.round((used / total) * 100)}%`;
}

function ratio(avg: number | null, peak: number | null): string {
  if (avg == null || peak == null || peak === 0) return '—';
  return (avg / peak).toFixed(2);
}

/** API responses wrap devices under `branches` (object or array) or return a branch directly. */
export function devicesOf(payload: unknown): DeviceLike[] {
  if (!payload || typeof payload !== 'object') return [];

  const root = payload as Record<string, unknown>;

  if (Array.isArray(root.devices)) {
    return root.devices as DeviceLike[];
  }

  const branches = root.branches;
  if (!branches) return [];

  if (Array.isArray(branches)) {
    return branches.flatMap((branch) => {
      if (!branch || typeof branch !== 'object') return [];
      const devices = (branch as { devices?: DeviceLike[] }).devices;
      return Array.isArray(devices) ? devices : [];
    });
  }

  if (typeof branches === 'object') {
    const devices = (branches as { devices?: DeviceLike[] }).devices;
    return Array.isArray(devices) ? devices : [];
  }

  return [];
}

function firstSourceScoreCard(payload: unknown): Record<string, unknown> | null {
  const devices = devicesOf(payload);
  const source = devices.find((d) => d.is_source) ?? devices[0];
  const card = source?.score_card;
  return card && typeof card === 'object' ? card : null;
}

function aggregatePapr(payload: unknown): { peak: number | null; avg: number | null } {
  const devices = devicesOf(payload);
  const peaks: number[] = [];
  const avgs: number[] = [];

  for (const device of devices) {
    const papr = device.score_card?.peak_to_avg_power_ratio as Record<string, unknown> | undefined;
    const peak = asNumber(papr?.peak);
    const avg = asNumber(papr?.avg);
    if (peak != null) peaks.push(peak);
    if (avg != null) avgs.push(avg);
  }

  if (!peaks.length && !avgs.length) {
    const fallback = firstSourceScoreCard(payload)?.peak_to_avg_power_ratio as
      | Record<string, unknown>
      | undefined;
    return {
      peak: asNumber(fallback?.peak),
      avg: asNumber(fallback?.avg),
    };
  }

  const peak = peaks.length ? Math.max(...peaks) : null;
  const avg = avgs.length ? avgs.reduce((sum, value) => sum + value, 0) / avgs.length : null;
  return { peak, avg };
}

function sumCarbonEmissions(payload: unknown): Record<string, unknown> | null {
  const devices = devicesOf(payload);
  let estimated = 0;
  let actual = 0;
  let unit = 'tonnes';
  let found = false;

  for (const device of devices) {
    const carbon = device.score_card?.score_card_carbon_emissions as
      | Record<string, unknown>
      | undefined;
    const est = asNumber(carbon?.estimated_value);
    const act = asNumber(carbon?.actual_value);
    if (est != null) {
      estimated += est;
      found = true;
    }
    if (act != null) {
      actual += act;
      found = true;
    }
    if (typeof carbon?.unit === 'string') unit = carbon.unit;
  }

  if (!found) {
    const fallback = firstSourceScoreCard(payload);
    const carbon = (fallback?.score_card_carbon_emissions ?? fallback?.carbon_emissions) as
      | Record<string, unknown>
      | undefined;
    return carbon ?? null;
  }

  return { estimated_value: estimated, actual_value: actual, unit };
}

function daysInMonth(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

function savingsInbound(forecast: number | null, used: number | null): number | null {
  if (forecast == null || used == null) return null;
  const day = new Date().getDate();
  return forecast - (used / day) * daysInMonth();
}

function savingsColor(value: number | null): string | undefined {
  if (value == null) return undefined;
  return value > 0 ? '#22c55e' : '#ef4444';
}

function getGeneratorSizeStatus(usage: number): ScorecardStatus {
  const ratio = usage / 100;

  if (ratio === 0.01) {
    return { tone: 'bad', label: 'Not in use' };
  }
  if (ratio > 0.7) {
    return { tone: 'bad', label: 'Overloaded' };
  }
  if (ratio >= 0.51) {
    return { tone: 'good', label: 'Efficient loading' };
  }
  if (ratio >= 0.36) {
    return { tone: 'good', label: 'Fairly efficient' };
  }
  return { tone: 'warn', label: 'Inefficient' };
}

function getFuelEfficiencyStatus(
  currentScore: number | null,
  baseline: number | null,
): ScorecardStatus {
  if (currentScore == null || baseline == null || baseline === 0) {
    return { tone: 'neutral', label: 'No data' };
  }

  const ratio = currentScore / baseline;
  if (ratio >= 0.95) {
    return { tone: 'good', label: 'On or above baseline' };
  }
  if (ratio >= 0.75) {
    return { tone: 'warn', label: 'Below baseline' };
  }
  return { tone: 'bad', label: 'Well below baseline' };
}

function generatorDevices(payload: unknown): DeviceLike[] {
  return devicesOf(payload).filter(
    (device) => device.is_generator || device.score_card?.is_generator,
  );
}

function allGeneratorMetrics(payload: unknown, field: string): Record<string, unknown>[] {
  const entries: Record<string, unknown>[] = [];

  for (const device of generatorDevices(payload)) {
    const value = device.score_card?.[field];
    if (!value || typeof value !== 'object') continue;
    entries.push({
      ...(value as Record<string, unknown>),
      name: device.name ?? 'Generator',
    });
  }

  return entries;
}

function metricFromBaseline(payload: unknown): ScorecardMetric {
  const card = firstSourceScoreCard(payload);
  const baseline = (card?.baseline_energy ?? {}) as Record<string, unknown>;
  const used = asNumber(baseline.used);
  const forecast = asNumber(baseline.forecast);
  const unit = typeof baseline.unit === 'string' ? baseline.unit : 'kWh';
  const day = new Date().getDate();
  const savings = savingsInbound(forecast, used);
  const headline = percent(used, forecast);

  const status: ScorecardStatus =
    savings == null
      ? { tone: 'neutral', label: 'No data' }
      : savings > 0
        ? { tone: 'good', label: 'On track' }
        : { tone: 'bad', label: 'Over forecast' };
  const ring = toneColor(status.tone);

  return {
    key: 'baseline',
    title: 'Baseline Energy',
    headline,
    headlineHint: used != null && forecast != null ? 'used' : undefined,
    status,
    chart: {
      segments: buildDoughnutSegments(used, forecast, ring),
      centerPrimary: headline,
      centerSecondary: used != null && forecast != null ? 'used' : undefined,
      accentColor: ring,
    },
    rows: [
      { label: 'Baseline Forecast', value: `${formatNumber(forecast)} ${unit}` },
      { label: `So far (${day} days)`, value: `${formatNumber(used)} ${unit}` },
      {
        label: 'Savings inbound',
        value: formatNumber(savings),
        accent: savingsColor(savings),
      },
    ],
  };
}

function metricFromPapr(payload: unknown): ScorecardMetric {
  const { peak, avg } = aggregatePapr(payload);
  const r = avg != null && peak != null && peak !== 0 ? avg / peak : null;
  const headline = ratio(avg, peak);

  const status: ScorecardStatus =
    r == null
      ? { tone: 'neutral', label: 'No data' }
      : r <= 0.6
        ? { tone: 'good', label: 'Balanced load' }
        : { tone: 'warn', label: 'High peak demand' };
  const ring = toneColor(status.tone);

  return {
    key: 'papr',
    title: 'Peak to Average Power Ratio',
    headline,
    status,
    chart: {
      segments: buildDoughnutSegments(avg, peak, ring),
      centerPrimary: headline,
      accentColor: ring,
    },
    rows: [
      { label: 'Average Load', value: `${formatNumber(avg)} kVA` },
      { label: 'Peak Load', value: `${formatNumber(peak)} kVA` },
      {
        label: 'Status',
        value: status.label === 'No data' ? '—' : status.label,
        accent: r == null ? undefined : ring,
      },
    ],
  };
}

function metricFromCarbon(payload: unknown): ScorecardMetric {
  const carbon = sumCarbonEmissions(payload) ?? {};
  const actual = asNumber(carbon.actual_value);
  const estimated = asNumber(carbon.estimated_value);
  const unit = typeof carbon.unit === 'string' ? carbon.unit : 'tonnes';
  const headline = percent(actual, estimated);
  const savings = savingsInbound(estimated, actual);
  const trees =
    savings != null ? (savings * 6).toLocaleString(undefined, { maximumFractionDigits: 2 }) : null;

  const status: ScorecardStatus =
    savings == null
      ? { tone: 'neutral', label: 'No data' }
      : savings > 0
        ? { tone: 'good', label: 'Below estimate' }
        : { tone: 'bad', label: 'Above estimate' };
  const ring = toneColor(status.tone);

  return {
    key: 'carbon',
    title: 'Carbon Emissions',
    headline,
    headlineHint: actual != null && estimated != null ? 'used' : undefined,
    status,
    chart: {
      segments: buildDoughnutSegments(actual, estimated, ring),
      centerPrimary: headline,
      centerSecondary: actual != null && estimated != null ? 'used' : undefined,
      accentColor: ring,
    },
    rows: [
      { label: 'Estimated', value: `${formatNumber(estimated)} ${unit}` },
      { label: 'Actual Emission', value: `${formatNumber(actual)} ${unit}` },
      {
        label: 'Savings inbound',
        value: formatNumber(savings),
        accent: savingsColor(savings),
      },
    ],
    footerNote:
      trees != null ? `Equivalent to ${trees} Acacia trees` : undefined,
  };
}

function metricFromGenSize(payload: unknown): ScorecardMetric {
  const generators = allGeneratorMetrics(payload, 'generator_size_efficiency');

  const tones: ScorecardTone[] = [];

  const generatorEntries: ScorecardGeneratorEntry[] = generators.map((data, index) => {
    const size = asNumber(data.size);
    const usage = asNumber(data.usage ?? data.percentage);
    const unit = typeof data.unit === 'string' ? data.unit : '%';
    const name = typeof data.name === 'string' ? data.name : 'Generator';
    const usageLabel = usage != null ? `${formatNumber(usage, 0)}${unit}` : '—';
    const status: ScorecardStatus =
      usage != null ? getGeneratorSizeStatus(usage) : { tone: 'neutral', label: 'No data' };
    const ring = toneColor(status.tone);
    tones.push(status.tone);

    return {
      key: `${name}-${index}`,
      chart: {
        segments: buildDoughnutSegments(usage, 100, ring),
        centerPrimary: usageLabel,
        centerSecondary: usage != null ? 'Used' : undefined,
        accentColor: ring,
      },
      name: size != null ? `${name} (${formatNumber(size)} kVA)` : name,
      subtitle: usage != null ? `${usageLabel} Load` : '—',
      status: { message: status.label, color: ring },
    };
  });

  const cardTone = tones.length ? worstTone(tones) : 'neutral';
  const cardLabel =
    !tones.length
      ? 'No data'
      : cardTone === 'good'
        ? 'Efficient overall'
        : cardTone === 'warn'
          ? 'Needs attention'
          : cardTone === 'bad'
            ? 'Action needed'
            : 'No data';

  return {
    key: 'gen-size',
    title: 'Generator Size Efficiency',
    headline: '—',
    status: { tone: cardTone, label: cardLabel },
    generatorEntries: generatorEntries.length ? generatorEntries : undefined,
    rows: generatorEntries.length
      ? []
      : [{ label: 'Generators', value: 'No generator data available' }],
    footer: 'Utilization factor for facility generators',
  };
}

function metricFromFuel(payload: unknown): ScorecardMetric {
  const generators = allGeneratorMetrics(payload, 'fuel_consumption');

  const tones: ScorecardTone[] = [];

  const generatorEntries: ScorecardGeneratorEntry[] = generators.map((data, index) => {
    const fuelEfficiency = (data.fuel_efficiency ?? {}) as Record<string, unknown>;
    const currentScore = asNumber(fuelEfficiency.current_score);
    const baseline = asNumber(fuelEfficiency.baseline);
    const dieselUsage = asNumber(data.diesel_usage);
    const timeUsed = asNumber(data.time_used);
    const size = asNumber(data.size);
    const name = typeof data.name === 'string' ? data.name : 'Generator';
    const scoreLabel = currentScore != null ? `${formatNumber(currentScore)} kWh/L` : '—';
    const status = getFuelEfficiencyStatus(currentScore, baseline);
    const ring = toneColor(status.tone);
    tones.push(status.tone);

    return {
      key: `${name}-${index}`,
      chart: {
        segments: buildDoughnutSegments(currentScore, baseline, ring),
        centerPrimary: scoreLabel,
        accentColor: ring,
      },
      name: size != null ? `${name} (${formatNumber(size)})` : name,
      subtitle: dieselUsage != null ? `${formatNumber(dieselUsage)} Litres` : '—',
      detail: timeUsed != null ? `${formatNumber(timeUsed)} hours` : undefined,
      status: { message: status.label, color: ring },
    };
  });

  const cardTone = tones.length ? worstTone(tones) : 'neutral';
  const cardLabel =
    !tones.length
      ? 'No data'
      : cardTone === 'good'
        ? 'Efficient overall'
        : cardTone === 'warn'
          ? 'Needs attention'
          : cardTone === 'bad'
            ? 'Action needed'
            : 'No data';

  return {
    key: 'fuel',
    title: 'Fuel Efficiency',
    headline: '—',
    status: { tone: cardTone, label: cardLabel },
    generatorEntries: generatorEntries.length ? generatorEntries : undefined,
    rows: generatorEntries.length
      ? []
      : [{ label: 'Generators', value: 'No generator data available' }],
    footer: 'Estimated fuel consumption for facility generators',
  };
}

function metricFromOperating(payload: unknown): ScorecardMetric {
  const generators = generatorDevices(payload);
  let totalHours = 0;
  let found = false;

  for (const device of generators) {
    const operating = device.score_card?.operating_time as Record<string, unknown> | undefined;
    const value = asNumber(
      (operating?.total as Record<string, unknown> | undefined)?.value ?? operating?.value,
    );
    if (value != null) {
      totalHours += value;
      found = true;
    }
  }

  const headline = found ? `${formatNumber(totalHours)} h` : '—';

  return {
    key: 'operating',
    title: 'Operating Time Deviation',
    headline,
    headlineHint: 'generator runtime',
    status: found
      ? { tone: 'neutral', label: 'Runtime tracked' }
      : { tone: 'neutral', label: 'No data' },
    rows: [
      { label: 'Generators tracked', value: String(generators.length || '—') },
      { label: 'Total operating time', value: found ? `${formatNumber(totalHours)} h` : '—' },
    ],
  };
}

export function buildScorecardMetrics(data: {
  baseline: unknown;
  papr: unknown;
  carbon: unknown;
  genSize: unknown;
  fuel: unknown;
  operating: unknown;
}): ScorecardMetric[] {
  return [
    metricFromBaseline(data.baseline),
    metricFromPapr(data.papr),
    metricFromCarbon(data.carbon),
    metricFromGenSize(data.genSize),
    metricFromFuel(data.fuel),
    metricFromOperating(data.operating),
  ];
}
