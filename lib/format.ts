export function formatKw(value: number | null | undefined, digits = 2): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${value.toFixed(digits)} kW`;
}

export function formatKwp(value: number | null | undefined, digits = 2): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${value.toFixed(digits)} kWp`;
}

export function formatKwh(value: number | null | undefined, digits = 1): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${value.toFixed(digits)} kWh`;
}

export function formatPercent(value: number | null | undefined, digits = 0): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${value.toFixed(digits)}%`;
}

export function formatNgn(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPlainNumber(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '0';
  return Number(value).toLocaleString();
}

export function formatNumber(value: number | null | undefined, digits = 2): string {
  if (value == null || Number.isNaN(value)) return '—';
  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: 0,
  });
}

export function formatLitres(value: number | null | undefined, digits = 2): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${formatNumber(value, digits)} L`;
}

/** Matches web convertDecimalTimeToNormal — decimal hours to "X hours Y mins". */
export function formatDecimalHours(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  const num = Number(value);
  const hours = Math.floor(num);
  const minutes = Math.round((num - hours) * 60);
  const hourPart =
    hours > 0 ? `${hours} ${hours === 1 ? 'hour' : 'hours'}` : '';
  const minutePart =
    minutes > 0 ? `${minutes} ${minutes === 1 ? 'min' : 'mins'}` : '';
  if (!hourPart && !minutePart) return '0 mins';
  return [hourPart, minutePart].filter(Boolean).join(' ');
}

export function formatShortDate(value: string | null | undefined): string {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
