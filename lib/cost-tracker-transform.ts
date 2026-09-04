import type {
  BaselinePoint,
  CostTrackerBaseline,
  DieselPurchase,
  UtilityPurchase,
} from '@/lib/cost-tracker-types';

export function sortByDateDesc<T extends { date: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function dieselPurchaseAmount(row: DieselPurchase): number {
  return (row.quantity ?? 0) * (row.price_per_litre ?? 0);
}

export function flattenBaseline(baseline: CostTrackerBaseline | undefined): BaselinePoint[] {
  if (!baseline?.baseline) return [];

  const points: BaselinePoint[] = [];
  for (const deviceSeries of Object.values(baseline.baseline)) {
    if (Array.isArray(deviceSeries)) {
      points.push(...deviceSeries);
    }
  }

  const byDate = new Map<string, BaselinePoint>();
  for (const point of points) {
    const existing = byDate.get(point.date);
    if (existing) {
      existing.forecast += point.forecast ?? 0;
      existing.used += point.used ?? 0;
    } else {
      byDate.set(point.date, {
        date: point.date,
        forecast: point.forecast ?? 0,
        used: point.used ?? 0,
      });
    }
  }

  return [...byDate.values()].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

function monthKey(dateString: string): string {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

export type MonthlyCostPoint = {
  month: string;
  diesel: number;
  utility: number;
  total: number;
};

export function buildMonthlyCostSeries(
  diesel: DieselPurchase[] = [],
  utility: UtilityPurchase[] = [],
): MonthlyCostPoint[] {
  const totals = new Map<string, { diesel: number; utility: number }>();

  for (const row of diesel) {
    const key = monthKey(row.date);
    const current = totals.get(key) ?? { diesel: 0, utility: 0 };
    current.diesel += dieselPurchaseAmount(row);
    totals.set(key, current);
  }

  for (const row of utility) {
    const key = monthKey(row.date);
    const current = totals.get(key) ?? { diesel: 0, utility: 0 };
    current.utility += row.amount ?? 0;
    totals.set(key, current);
  }

  return [...totals.entries()]
    .map(([month, values]) => ({
      month,
      diesel: values.diesel,
      utility: values.utility,
      total: values.diesel + values.utility,
    }))
    .sort((a, b) => new Date(`1 ${a.month}`).getTime() - new Date(`1 ${b.month}`).getTime());
}

export function parseMonthForDrillDown(month: string): { year: string; month: string } | null {
  const cleaned = month.replace(/,/g, '').trim();
  const parsed = new Date(cleaned);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      year: String(parsed.getFullYear()),
      month: String(parsed.getMonth() + 1).padStart(2, '0'),
    };
  }

  const parts = cleaned.split(/[\s-/]+/).filter(Boolean);
  if (parts.length >= 2) {
    const year = parts.find((part) => /^\d{4}$/.test(part));
    const monthNames = [
      'jan', 'feb', 'mar', 'apr', 'may', 'jun',
      'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
    ];
    const monthIndex = parts.findIndex((part) =>
      monthNames.includes(part.slice(0, 3).toLowerCase()),
    );
    if (year && monthIndex >= 0) {
      return { year, month: String(monthIndex + 1).padStart(2, '0') };
    }
  }

  return null;
}

export function entriesInMonth<T extends { date: string }>(
  rows: T[],
  monthLabel: string,
): T[] {
  const parsed = parseMonthForDrillDown(monthLabel);
  if (!parsed) return rows;

  const targetYear = Number(parsed.year);
  const targetMonth = Number(parsed.month);

  return rows.filter((row) => {
    const date = new Date(row.date);
    if (Number.isNaN(date.getTime())) return true;
    return date.getFullYear() === targetYear && date.getMonth() + 1 === targetMonth;
  });
}
