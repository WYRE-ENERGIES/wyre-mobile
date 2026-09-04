import { APIService } from '@/config/api/apiServices';

export type ApiNotification = {
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
  read_at: string | null;
};

export type NotificationListResponse = {
  count: number;
  unread_count: number;
  limit: number;
  offset: number;
  results: ApiNotification[];
};

export type NotificationTypeCatalogItem = {
  code: string;
  label: string;
  category: string;
  action: string | null;
  destination: string | null;
  description: string;
};

export type ListNotificationsParams = {
  is_read?: boolean;
  type?: string;
  limit?: number;
  offset?: number;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

export function parseApiNotification(raw: unknown): ApiNotification | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const id = typeof item.id === 'number' ? item.id : Number(item.id);
  if (!Number.isFinite(id)) return null;

  return {
    id,
    type: typeof item.type === 'string' ? item.type : '',
    category: typeof item.category === 'string' ? item.category : '',
    title: typeof item.title === 'string' ? item.title : 'Wyre alert',
    body: typeof item.body === 'string' ? item.body : '',
    action: typeof item.action === 'string' ? item.action : null,
    destination: typeof item.destination === 'string' ? item.destination : null,
    payload: asRecord(item.payload),
    branch_id:
      typeof item.branch_id === 'number'
        ? item.branch_id
        : typeof item.branch_id === 'string'
          ? Number(item.branch_id) || null
          : null,
    branch_name: typeof item.branch_name === 'string' ? item.branch_name : null,
    is_read: item.is_read === true,
    created_at: typeof item.created_at === 'string' ? item.created_at : new Date().toISOString(),
    read_at: typeof item.read_at === 'string' ? item.read_at : null,
  };
}

export async function listNotifications(
  params: ListNotificationsParams = {},
): Promise<NotificationListResponse> {
  const response = await APIService.get('notifications/', { params });
  const data = (response.data ?? {}) as Record<string, unknown>;
  const results = Array.isArray(data.results)
    ? data.results.map(parseApiNotification).filter((item): item is ApiNotification => item != null)
    : [];

  return {
    count: typeof data.count === 'number' ? data.count : results.length,
    unread_count: typeof data.unread_count === 'number' ? data.unread_count : 0,
    limit: typeof data.limit === 'number' ? data.limit : params.limit ?? 20,
    offset: typeof data.offset === 'number' ? data.offset : params.offset ?? 0,
    results,
  };
}

export async function fetchUnreadCount(): Promise<number> {
  const response = await APIService.get('notifications/unread-count/');
  const count = response.data?.unread_count;
  return typeof count === 'number' ? count : 0;
}

export async function fetchNotification(id: number): Promise<ApiNotification> {
  const response = await APIService.get(`notifications/${id}/`);
  const parsed = parseApiNotification(response.data);
  if (!parsed) {
    throw new Error('Invalid notification response');
  }
  return parsed;
}

export async function markNotificationRead(id: number): Promise<ApiNotification> {
  const response = await APIService.post(`notifications/${id}/read/`);
  const parsed = parseApiNotification(response.data);
  if (!parsed) {
    throw new Error('Invalid notification response');
  }
  return parsed;
}

export async function markAllNotificationsRead(): Promise<number> {
  const response = await APIService.post('notifications/mark-all-read/');
  const marked = response.data?.marked_read;
  return typeof marked === 'number' ? marked : 0;
}

export async function deleteNotifications(body: { ids: number[] } | { all: true }): Promise<number> {
  const response = await APIService.delete('notifications/delete/', body);
  const deleted = response.data?.deleted;
  return typeof deleted === 'number' ? deleted : 0;
}

export async function fetchNotificationTypes(): Promise<NotificationTypeCatalogItem[]> {
  const response = await APIService.get('notifications/types/');
  const types = response.data?.types;
  if (!Array.isArray(types)) return [];

  return types
    .map((item: unknown) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      if (typeof row.code !== 'string') return null;
      return {
        code: row.code,
        label: typeof row.label === 'string' ? row.label : row.code,
        category: typeof row.category === 'string' ? row.category : '',
        action: typeof row.action === 'string' ? row.action : null,
        destination: typeof row.destination === 'string' ? row.destination : null,
        description: typeof row.description === 'string' ? row.description : '',
      } satisfies NotificationTypeCatalogItem;
    })
    .filter((item): item is NotificationTypeCatalogItem => item != null);
}

export function parseNotificationId(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && /^\d+$/.test(value.trim())) {
    return Number(value.trim());
  }
  return null;
}
