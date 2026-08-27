export function formatNumber(value: number | null | undefined, digits = 1): string {
  if (value == null || Number.isNaN(value)) return '0';
  return value.toLocaleString(undefined, {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits === 0 ? 0 : undefined,
  });
}

export function formatKwh(value: number | null | undefined, digits = 0): string {
  return `${formatNumber(value, digits)} kWh`;
}

export function formatKw(value: number | null | undefined, digits = 2): string {
  return `${formatNumber(value, digits)} kW`;
}

export function formatKwp(value: number | null | undefined, digits = 1): string {
  return `${formatNumber(value, digits)} kWp`;
}

export function formatNaira(value: number | null | undefined, digits = 0): string {
  const amount = value ?? 0;
  return `₦ ${amount.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

export function formatNgn(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatLitres(value: number | null | undefined, digits = 2): string {
  if (value == null || Number.isNaN(value)) return '—';
  return `${formatNumber(value, digits)} L`;
}

export function formatDecimalHours(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—';
  const hours = Math.floor(value);
  const minutes = Math.round((value - hours) * 60);
  const parts = [
    hours ? `${hours} ${hours === 1 ? 'hour' : 'hours'}` : '',
    minutes ? `${minutes} ${minutes === 1 ? 'min' : 'mins'}` : '',
  ].filter(Boolean);
  return parts.join(' ') || '0 mins';
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

export function greetingForHour(hour = new Date().getHours()): string {
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}
