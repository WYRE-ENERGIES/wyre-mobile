export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';

export type AlertCategory =
  | 'energy'
  | 'battery'
  | 'solar'
  | 'diesel'
  | 'power_quality'
  | 'operations'
  | 'environment';

export type WyreAlert = {
  id: string;
  title: string;
  body: string;
  branchName: string;
  category: AlertCategory;
  severity: AlertSeverity;
  createdAt: string;
  read: boolean;
  source?: 'server' | 'local';
  serverId?: number | null;
  type?: string;
  action?: string | null;
  destination?: string | null;
  branchId?: number | null;
  payload?: Record<string, unknown> | null;
};

export type AlertFilter = 'all' | 'unread' | AlertCategory;

export type AlertSection = {
  title: string;
  data: WyreAlert[];
};

const VALID_CATEGORIES = new Set<AlertCategory>([
  'energy',
  'battery',
  'solar',
  'diesel',
  'power_quality',
  'operations',
  'environment',
]);

const VALID_SEVERITIES = new Set<AlertSeverity>(['critical', 'warning', 'info', 'success']);

const LEGACY_CATEGORY_MAP: Record<string, AlertCategory> = {
  generation: 'solar',
  inverter: 'solar',
  weather: 'solar',
  capacity: 'solar',
  maintenance: 'operations',
  system: 'operations',
};

export function parseAlertCategory(value: unknown): AlertCategory {
  if (typeof value !== 'string' || !value.trim()) return 'energy';
  if (VALID_CATEGORIES.has(value as AlertCategory)) {
    return value as AlertCategory;
  }
  return LEGACY_CATEGORY_MAP[value] ?? 'energy';
}

export function inferAlertSeverity(
  type?: string,
  category?: string,
  payload?: Record<string, unknown> | null,
): AlertSeverity {
  if (type === 'daily_battery_soc') {
    const verdict = String(payload?.verdict ?? '').toLowerCase();
    const status = String(payload?.status_message ?? '').toLowerCase();
    const soc = Number(payload?.battery_soc);
    if (verdict === 'at_risk' || verdict === 'critical' || status.includes('critical')) {
      return 'critical';
    }
    if (
      status.includes('excellent') ||
      status.includes('good') ||
      (Number.isFinite(soc) && soc >= 70)
    ) {
      return 'success';
    }
    if (status.includes('poor') || status.includes('low') || (Number.isFinite(soc) && soc < 50)) {
      return 'warning';
    }
    return 'info';
  }
  if (type === 'daily_solar_usage') return 'success';
  if (type?.includes('over_usage')) return 'warning';
  if (type === 'daily_unfavorable_weather' || type === 'solar_soiling') return 'warning';
  if (type === 'diesel_entry_reminder') return 'warning';
  if (type === 'energy_usage_target') {
    const pct = Number(payload?.pct);
    if (Number.isFinite(pct) && pct >= 100) return 'critical';
    if (Number.isFinite(pct) && pct >= 80) return 'warning';
    return 'info';
  }
  if (category === 'operations' || type === 'test') return 'info';
  return 'info';
}

export function mapApiNotificationToAlert(item: {
  id: number;
  type: string;
  category: string;
  title: string;
  body: string;
  action: string | null;
  destination: string | null;
  payload: Record<string, unknown> | null;
  branch_id: number | null;
  branch_name: string | null;
  is_read: boolean;
  created_at: string;
}): WyreAlert {
  return {
    id: String(item.id),
    serverId: item.id,
    source: 'server',
    title: item.title,
    body: item.body,
    branchName: item.branch_name?.trim() || 'Wyre EMS',
    category: parseAlertCategory(item.category),
    severity: inferAlertSeverity(item.type, item.category, item.payload),
    createdAt: item.created_at,
    read: item.is_read,
    type: item.type,
    action: item.action,
    destination: item.destination,
    branchId: item.branch_id,
    payload: item.payload,
  };
}

export function parseAlertSeverity(value: unknown): AlertSeverity {
  if (typeof value === 'string' && VALID_SEVERITIES.has(value as AlertSeverity)) {
    return value as AlertSeverity;
  }
  return 'info';
}

export function filterAlerts(alerts: WyreAlert[], filter: AlertFilter): WyreAlert[] {
  if (filter === 'unread') {
    return alerts.filter((alert) => !alert.read);
  }
  if (filter !== 'all') {
    return alerts.filter((alert) => alert.category === filter);
  }
  return alerts;
}

export function countUnreadAlerts(alerts: WyreAlert[]): number {
  return alerts.filter((alert) => !alert.read).length;
}

export function formatAlertTime(isoDate: string, now = new Date()): string {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return '';

  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) {
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 1) {
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  if (diffDays < 7) {
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  }

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function startOfDay(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

export function groupAlertsByDate(alerts: WyreAlert[], now = new Date()): AlertSection[] {
  const today = startOfDay(now);
  const yesterday = today - 86400000;

  const buckets: Record<'Today' | 'Yesterday' | 'Earlier', WyreAlert[]> = {
    Today: [],
    Yesterday: [],
    Earlier: [],
  };

  const sorted = [...alerts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  for (const alert of sorted) {
    const day = startOfDay(new Date(alert.createdAt));
    if (day === today) buckets.Today.push(alert);
    else if (day === yesterday) buckets.Yesterday.push(alert);
    else buckets.Earlier.push(alert);
  }

  return (['Today', 'Yesterday', 'Earlier'] as const)
    .filter((title) => buckets[title].length > 0)
    .map((title) => ({ title, data: buckets[title] }));
}
