import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  mapApiNotificationToAlert,
  parseAlertCategory,
  parseAlertSeverity,
  type AlertCategory,
  type AlertSeverity,
  type WyreAlert,
} from '@/lib/alerts';
import {
  fetchUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  parseNotificationId,
} from '@/lib/notifications-api';

const INBOX_STORAGE_KEY = 'wyreNotificationInbox';
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type CombinedInbox = {
  alerts: WyreAlert[];
  unreadCount: number;
};

type InboxListener = () => void;
const listeners = new Set<InboxListener>();

let inboxCache: CombinedInbox | null = null;
let inboxCacheAt = 0;
const INBOX_CACHE_MS = 4000;

function notifyListeners(): void {
  inboxCache = null;
  inboxCacheAt = 0;
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // ignore subscriber errors
    }
  });
}

export function subscribeNotificationInbox(listener: InboxListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function notifyInboxChanged(): void {
  notifyListeners();
}

function createAlertId(): string {
  return `alert-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function pruneExpired(alerts: WyreAlert[], now = Date.now()): WyreAlert[] {
  const cutoff = now - ONE_WEEK_MS;
  return alerts.filter((alert) => new Date(alert.createdAt).getTime() >= cutoff);
}

function isLocalAlert(alert: WyreAlert): boolean {
  return alert.source === 'local' || (alert.serverId == null && alert.id.startsWith('alert-'));
}

async function readInboxRaw(): Promise<WyreAlert[]> {
  const raw = await AsyncStorage.getItem(INBOX_STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as WyreAlert[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeInbox(alerts: WyreAlert[]): Promise<void> {
  const pruned = pruneExpired(alerts.filter(isLocalAlert));
  await AsyncStorage.setItem(INBOX_STORAGE_KEY, JSON.stringify(pruned));
  notifyListeners();
}

async function loadLocalInbox(): Promise<WyreAlert[]> {
  const alerts = pruneExpired(await readInboxRaw()).filter(isLocalAlert);
  return alerts.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function loadNotificationInbox(): Promise<CombinedInbox> {
  if (inboxCache && Date.now() - inboxCacheAt < INBOX_CACHE_MS) {
    return inboxCache;
  }

  const localPromise = loadLocalInbox();
  const remotePromise = listNotifications({ limit: 100, offset: 0 }).catch(() => null);
  const unreadPromise = fetchUnreadCount().catch(() => null);

  const [local, remote, unread] = await Promise.all([
    localPromise,
    remotePromise,
    unreadPromise,
  ]);

  const serverAlerts = (remote?.results ?? []).map(mapApiNotificationToAlert);
  const merged = [...serverAlerts, ...local].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const localUnread = local.filter((alert) => !alert.read).length;
  const serverUnread = unread ?? remote?.unread_count ?? 0;

  inboxCache = {
    alerts: merged,
    unreadCount: serverUnread + localUnread,
  };
  inboxCacheAt = Date.now();
  return inboxCache;
}

export type SaveNotificationInput = {
  title: string;
  body: string;
  branchName?: string;
  category?: AlertCategory;
  severity?: AlertSeverity;
  data?: Record<string, unknown>;
  createdAt?: string;
  read?: boolean;
};

function branchFromData(data?: Record<string, unknown>): string | undefined {
  if (!data) return undefined;
  if (typeof data.branch_name === 'string' && data.branch_name.trim()) return data.branch_name.trim();
  if (typeof data.branchName === 'string' && data.branchName.trim()) return data.branchName.trim();
  if (typeof data.branch === 'string' && data.branch.trim()) return data.branch.trim();
  return undefined;
}

/**
 * Persist a local-only inbox item (iOS simulator tests).
 * Server-backed FCM pushes should refresh the API list instead.
 */
export async function saveNotificationToInbox(input: SaveNotificationInput): Promise<WyreAlert> {
  const data = input.data ?? {};
  if (parseNotificationId(data.notification_id) != null) {
    notifyListeners();
    return {
      id: String(data.notification_id),
      serverId: parseNotificationId(data.notification_id),
      source: 'server',
      title: input.title.trim() || 'Wyre alert',
      body: input.body.trim(),
      branchName: input.branchName ?? branchFromData(data) ?? 'Wyre EMS',
      category: input.category ?? parseAlertCategory(data.category),
      severity: input.severity ?? parseAlertSeverity(data.severity),
      createdAt: input.createdAt ?? new Date().toISOString(),
      read: input.read ?? false,
    };
  }

  const title = input.title.trim() || 'Wyre alert';
  const body = input.body.trim() || '';

  const existing = await loadLocalInbox();
  const duplicate = existing.find(
    (item) =>
      item.title === title &&
      item.body === body &&
      Date.now() - new Date(item.createdAt).getTime() < 10_000,
  );
  if (duplicate) {
    notifyListeners();
    return duplicate;
  }

  const alert: WyreAlert = {
    id: createAlertId(),
    serverId: null,
    source: 'local',
    title,
    body,
    branchName: input.branchName ?? branchFromData(data) ?? 'Wyre EMS',
    category: input.category ?? parseAlertCategory(data.category),
    severity: input.severity ?? parseAlertSeverity(data.severity),
    createdAt: input.createdAt ?? new Date().toISOString(),
    read: input.read ?? false,
    type: typeof data.type === 'string' ? data.type : undefined,
  };

  const next = pruneExpired([alert, ...existing]);
  await writeInbox(next);
  return alert;
}

export async function markAlertRead(alertId: string): Promise<void> {
  const serverId = parseNotificationId(alertId);
  if (serverId != null) {
    await markNotificationRead(serverId);
    notifyListeners();
    return;
  }

  const existing = await loadLocalInbox();
  const next = existing.map((item) =>
    item.id === alertId ? { ...item, read: true } : item,
  );
  await writeInbox(next);
}

export async function markAllAlertsRead(): Promise<void> {
  try {
    await markAllNotificationsRead();
  } catch {
    // still mark local items
  }

  const existing = await loadLocalInbox();
  const next = existing.map((item) => ({ ...item, read: true }));
  await writeInbox(next);
}

export async function getLocalAlert(alertId: string): Promise<WyreAlert | null> {
  const local = await loadLocalInbox();
  return local.find((item) => item.id === alertId) ?? null;
}

export async function clearNotificationInbox(): Promise<void> {
  await AsyncStorage.removeItem(INBOX_STORAGE_KEY);
  notifyListeners();
}
