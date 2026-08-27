export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';

export type AlertCategory =
  | 'generation'
  | 'inverter'
  | 'battery'
  | 'weather'
  | 'capacity'
  | 'maintenance';

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

export type AlertFilter = 'all' | 'unread';

export type AlertSection = {
  title: string;
  data: WyreAlert[];
};

const VALID_CATEGORIES = new Set<AlertCategory>([
  'generation',
  'inverter',
  'battery',
  'weather',
  'capacity',
  'maintenance',
]);

const VALID_SEVERITIES = new Set<AlertSeverity>(['critical', 'warning', 'info', 'success']);

const API_CATEGORY_MAP: Record<string, AlertCategory> = {
  energy: 'generation',
  solar: 'generation',
  battery: 'battery',
  system: 'maintenance',
};

export function parseAlertCategory(value: unknown): AlertCategory {
  if (typeof value !== 'string') return 'generation';
  if (API_CATEGORY_MAP[value]) return API_CATEGORY_MAP[value];
  if (VALID_CATEGORIES.has(value as AlertCategory)) {
    return value as AlertCategory;
  }
  return 'generation';
}

export function inferAlertSeverity(type?: string, category?: string): AlertSeverity {
  if (type?.includes('over_usage')) return 'warning';
  if (type === 'daily_battery_soc') return 'warning';
  if (category === 'system' || type === 'test') return 'info';
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
    severity: inferAlertSeverity(item.type, item.category),
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
