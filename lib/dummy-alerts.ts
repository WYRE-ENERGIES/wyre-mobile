export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';

export type AlertCategory =
  | 'generation'
  | 'inverter'
  | 'battery'
  | 'weather'
  | 'capacity'
  | 'maintenance';

export type SolarAlert = {
  id: string;
  title: string;
  body: string;
  branchName: string;
  category: AlertCategory;
  severity: AlertSeverity;
  createdAt: string;
  read: boolean;
};

export type AlertFilter = 'all' | 'unread';

export type AlertSection = {
  title: string;
  data: SolarAlert[];
};

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function daysAgo(days: number, hour = 10): string {
  const date = new Date();
  date.setHours(hour, 20, 0, 0);
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

/** Sample inbox data until Firebase push delivery is wired. */
export const DUMMY_ALERTS: SolarAlert[] = [
  {
    id: 'alert-1',
    title: 'Inverter offline',
    body: 'Stopped reporting 12 minutes ago',
    branchName: 'Abuja-03',
    category: 'inverter',
    severity: 'critical',
    createdAt: hoursAgo(0.2),
    read: false,
  },
  {
    id: 'alert-2',
    title: 'Generation below forecast',
    body: '18% below expected output this hour',
    branchName: 'Lagos-01',
    category: 'generation',
    severity: 'warning',
    createdAt: hoursAgo(1.1),
    read: false,
  },
  {
    id: 'alert-3',
    title: 'Battery low',
    body: 'Charge dropped below 25%',
    branchName: 'The Beach house',
    category: 'battery',
    severity: 'warning',
    createdAt: hoursAgo(3.5),
    read: false,
  },
  {
    id: 'alert-4',
    title: 'Cloudy conditions expected',
    body: 'Generation may stay below baseline this afternoon',
    branchName: 'Port Harcourt-02',
    category: 'weather',
    severity: 'info',
    createdAt: hoursAgo(18),
    read: true,
  },
  {
    id: 'alert-5',
    title: 'High capacity use',
    body: 'Utilization crossed 92%',
    branchName: 'Ikeja Hub',
    category: 'capacity',
    severity: 'warning',
    createdAt: daysAgo(1, 14),
    read: true,
  },
  {
    id: 'alert-6',
    title: 'New daily peak',
    body: 'Reached 412 kWh today',
    branchName: 'Port Harcourt-02',
    category: 'generation',
    severity: 'success',
    createdAt: daysAgo(1, 12),
    read: true,
  },
  {
    id: 'alert-7',
    title: 'Panel cleaning due',
    body: 'Scheduled for tomorrow morning',
    branchName: 'Polaris Bank',
    category: 'maintenance',
    severity: 'info',
    createdAt: daysAgo(2, 9),
    read: true,
  },
  {
    id: 'alert-8',
    title: 'Inverter back online',
    body: 'Connection restored after a short outage',
    branchName: 'Abuja-01',
    category: 'inverter',
    severity: 'success',
    createdAt: daysAgo(3, 16),
    read: true,
  },
];

export function filterAlerts(alerts: SolarAlert[], filter: AlertFilter): SolarAlert[] {
  if (filter === 'unread') {
    return alerts.filter((alert) => !alert.read);
  }
  return alerts;
}

export function countUnreadAlerts(alerts: SolarAlert[]): number {
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

export function groupAlertsByDate(alerts: SolarAlert[], now = new Date()): AlertSection[] {
  const today = startOfDay(now);
  const yesterday = today - 86400000;

  const buckets: Record<'Today' | 'Yesterday' | 'Earlier', SolarAlert[]> = {
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
