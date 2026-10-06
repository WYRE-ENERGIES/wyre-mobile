import {
  inferAlertSeverity,
  parseAlertCategory,
  type AlertCategory,
  type AlertSeverity,
} from '@/lib/alerts';
import { formatKwh, formatNumber, formatShortDate } from '@/lib/format';
import {
  resolveDestination,
  routeForDestination,
  type NotificationRoute,
} from '@/lib/notification-routing';
import type { ApiNotification } from '@/lib/notifications-api';

export const CATEGORY_LABELS: Record<AlertCategory, string> = {
  energy: 'Energy',
  battery: 'Battery',
  solar: 'Solar',
  diesel: 'Diesel',
  power_quality: 'Power quality',
  operations: 'Operations',
  environment: 'Environment',
};

export const TYPE_LABELS: Record<string, string> = {
  daily_energy_usage: 'Daily energy usage',
  energy_usage_target: 'Energy usage target',
  weekly_energy_usage: 'Weekly energy report',
  daily_solar_usage: 'Daily solar generation',
  daily_unfavorable_weather: 'Solar weather advisory',
  solar_soiling: 'Panel soiling',
  over_usage_solar_capacity: 'Solar capacity over-usage',
  daily_battery_soc: 'Battery state of charge',
  over_usage_solar_power_demand: 'Night battery over-usage',
  diesel_entry_reminder: 'Diesel entry reminder',
};

const CATEGORY_ICONS = {
  energy: 'bolt.fill',
  battery: 'battery.100.bolt',
  solar: 'sun.max.fill',
  diesel: 'fuelpump.fill',
  power_quality: 'powerplug.fill',
  operations: 'wrench.and.screwdriver.fill',
  environment: 'leaf.fill',
} as const;

export type NotificationHero = {
  value: string;
  unit?: string;
  caption?: string;
  progress?: number;
};

export type NotificationFact = {
  label: string;
  value: string;
};

export type NotificationCta = {
  label: string;
  route: NotificationRoute;
  params?: Record<string, string>;
};

export type NotificationViewModel = {
  category: AlertCategory;
  categoryLabel: string;
  typeLabel: string;
  icon: (typeof CATEGORY_ICONS)[AlertCategory];
  branchName: string;
  timeLabel: string;
  title: string;
  body: string;
  severity: AlertSeverity;
  hero?: NotificationHero;
  facts: NotificationFact[];
  cta: NotificationCta | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function payloadValue(payload: Record<string, unknown>, keys: string[]): unknown {
  for (const key of keys) {
    if (payload[key] != null && payload[key] !== '') return payload[key];
  }
  return undefined;
}

function payloadNumber(payload: Record<string, unknown>, keys: string[]): number | null {
  const raw = payloadValue(payload, keys);
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string' && raw.trim()) {
    const parsed = Number(raw.replace(/,/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function payloadString(payload: Record<string, unknown>, keys: string[]): string | null {
  const raw = payloadValue(payload, keys);
  if (typeof raw === 'string' && raw.trim()) return raw.trim();
  if (typeof raw === 'number' && Number.isFinite(raw)) return String(raw);
  return null;
}

function formatWhen(isoDate: string): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function humanHorizon(value: string | null): string | null {
  if (!value) return null;
  if (value === 'until_sunrise') return 'Until sunrise';
  if (value === 'rest_of_day') return 'Rest of day';
  return value.replace(/_/g, ' ');
}

function humanTrigger(value: string | null): string | null {
  if (!value) return null;
  if (value === 'scheduled') return 'Scheduled check';
  if (value === 'threshold') return 'Crossed a threshold';
  return value.replace(/_/g, ' ');
}

function clampProgress(value: number | null): number | undefined {
  if (value == null || !Number.isFinite(value)) return undefined;
  return Math.max(0, Math.min(1, value / 100));
}

function batteryNeedsAction(payload: Record<string, unknown>, severity: AlertSeverity): boolean {
  if (severity === 'critical' || severity === 'warning') return true;
  const verdict = payloadString(payload, ['verdict'])?.toLowerCase();
  return verdict === 'at_risk' || verdict === 'critical';
}

function energyNeedsAction(payload: Record<string, unknown>): boolean {
  const pct = payloadNumber(payload, ['pct']);
  const threshold = payloadNumber(payload, ['threshold']);
  if (pct == null) return false;
  if (pct >= 100) return true;
  return threshold != null && pct >= threshold;
}

function ctaFor(
  type: string,
  payload: Record<string, unknown>,
  destination: string | null,
  severity: AlertSeverity,
): NotificationCta | null {
  const route = routeForDestination(resolveDestination({ destination, type }));
  if (route === '/alerts') return null;

  switch (type) {
    case 'diesel_entry_reminder': {
      const missed = payloadString(payload, ['missed_date']);
      return {
        label: 'Record diesel entry',
        route,
        params:
          missed && /^\d{4}-\d{2}-\d{2}$/.test(missed) ? { missed_date: missed } : undefined,
      };
    }
    case 'energy_usage_target':
      return energyNeedsAction(payload) ? { label: 'Review energy use', route } : null;
    case 'over_usage_solar_capacity':
      return { label: 'Review solar load', route };
    case 'over_usage_solar_power_demand':
      return { label: 'Check battery', route };
    case 'daily_battery_soc':
      return batteryNeedsAction(payload, severity) ? { label: 'Check battery', route } : null;
    default:
      return null;
  }
}

function factsFor(type: string, payload: Record<string, unknown>): NotificationFact[] {
  const facts: NotificationFact[] = [];

  switch (type) {
    case 'daily_battery_soc': {
      const horizon = humanHorizon(payloadString(payload, ['horizon']));
      const trigger = humanTrigger(payloadString(payload, ['trigger']));
      if (horizon) facts.push({ label: 'Lookahead', value: horizon });
      if (trigger) facts.push({ label: 'Why it fired', value: trigger });
      break;
    }
    case 'daily_solar_usage': {
      const carbon = payloadNumber(payload, ['carbon_offset_tonnes', 'carbon_offset', 'co2_tonnes']);
      if (carbon != null) {
        facts.push({ label: 'CO2 avoided', value: `${formatNumber(carbon, 3)} t` });
      }
      break;
    }
    case 'energy_usage_target': {
      const used = payloadNumber(payload, ['used_kwh']);
      const target = payloadNumber(payload, ['target_kwh']);
      const threshold = payloadNumber(payload, ['threshold']);
      if (used != null) facts.push({ label: 'Used so far', value: formatKwh(used, 1) });
      if (target != null) facts.push({ label: 'Monthly target', value: formatKwh(target, 0) });
      if (threshold != null) {
        facts.push({ label: 'Alerted at', value: `${formatNumber(threshold, 0)}% of target` });
      }
      break;
    }
    case 'diesel_entry_reminder': {
      const missed = payloadString(payload, ['missed_date']);
      if (missed) facts.push({ label: 'Missing entry', value: formatShortDate(missed) });
      break;
    }
    case 'daily_unfavorable_weather': {
      const date = payloadString(payload, ['date']);
      const csi = payloadNumber(payload, ['csi']);
      const severity = payloadNumber(payload, ['severity']);
      if (date) facts.push({ label: 'Forecast day', value: formatShortDate(date) });
      if (csi != null) facts.push({ label: 'Clear-sky index', value: formatNumber(csi, 2) });
      if (severity != null) facts.push({ label: 'Severity', value: formatNumber(severity, 2) });
      break;
    }
    case 'over_usage_solar_capacity': {
      const pct = payloadNumber(payload, ['pct', 'utilization_pct', 'load_pct']);
      const threshold = payloadNumber(payload, ['threshold', 'threshold_pct']);
      if (pct != null) facts.push({ label: 'Load vs capacity', value: `${formatNumber(pct, 0)}%` });
      if (threshold != null) facts.push({ label: 'Alerted at', value: `${formatNumber(threshold, 0)}%` });
      break;
    }
    case 'over_usage_solar_power_demand': {
      const horizon = humanHorizon(payloadString(payload, ['horizon']));
      if (horizon) facts.push({ label: 'Lookahead', value: horizon });
      break;
    }
    case 'daily_energy_usage': {
      const used = payloadNumber(payload, ['used_kwh', 'kwh', 'energy_kwh']);
      if (used != null) facts.push({ label: 'Energy used', value: formatKwh(used, 1) });
      break;
    }
    default:
      break;
  }

  return facts;
}

function heroFor(type: string, payload: Record<string, unknown>): NotificationHero | undefined {
  switch (type) {
    case 'daily_battery_soc': {
      const soc = payloadNumber(payload, ['battery_soc', 'soc']);
      if (soc == null) return undefined;
      return {
        value: `${formatNumber(soc, 0)}%`,
        caption: 'State of charge',
        progress: clampProgress(soc),
      };
    }
    case 'daily_solar_usage': {
      const kwh = payloadNumber(payload, ['generation_kwh', 'generated_kwh', 'kwh']);
      if (kwh == null) return undefined;
      return {
        value: formatNumber(kwh, 1),
        unit: 'kWh',
        caption: 'Generated today',
      };
    }
    case 'energy_usage_target': {
      const pct = payloadNumber(payload, ['pct']);
      if (pct == null) return undefined;
      return {
        value: `${formatNumber(pct, 0)}%`,
        caption: 'of this month\'s target',
        progress: clampProgress(pct),
      };
    }
    case 'diesel_entry_reminder': {
      const missed = payloadString(payload, ['missed_date']);
      return {
        value: 'Missing',
        caption: missed ? formatShortDate(missed) : "Yesterday's diesel entry",
      };
    }
    case 'over_usage_solar_capacity': {
      const pct = payloadNumber(payload, ['pct', 'utilization_pct', 'load_pct']);
      if (pct == null) return undefined;
      return {
        value: `${formatNumber(pct, 0)}%`,
        caption: 'of inverter capacity',
        progress: clampProgress(pct),
      };
    }
    case 'daily_energy_usage': {
      const used = payloadNumber(payload, ['used_kwh', 'kwh', 'energy_kwh']);
      if (used == null) return undefined;
      return {
        value: formatNumber(used, 1),
        unit: 'kWh',
        caption: 'Used yesterday',
      };
    }
    default:
      return undefined;
  }
}

export function presentNotification(item: ApiNotification): NotificationViewModel {
  const payload = asRecord(item.payload);
  const category = parseAlertCategory(item.category);
  const branchName = item.branch_name?.trim() || 'Wyre EMS';
  const severity = inferAlertSeverity(item.type, item.category, payload);
  const typeLabel = TYPE_LABELS[item.type] ?? item.title;

  return {
    category,
    categoryLabel: CATEGORY_LABELS[category],
    typeLabel,
    icon: CATEGORY_ICONS[category],
    branchName,
    timeLabel: formatWhen(item.created_at),
    title: typeLabel,
    body: item.body,
    severity,
    hero: heroFor(item.type, payload),
    facts: factsFor(item.type, payload),
    cta: ctaFor(item.type, payload, item.destination, severity),
  };
}
