import AsyncStorage from '@react-native-async-storage/async-storage';

/** Storage keys aligned with wyre-dashboard localStorage. */
export const STORAGE_KEYS = {
  token: 'loggedWyreUser',
  currentUser: 'currentUser',
  notificationsEnabled: 'wyreNotificationsEnabled',
  fcmDeviceToken: 'wyreFcmDeviceToken',
  themeScheme: 'wyreThemeScheme',
} as const;

export type AuthTokenPair = {
  access: string;
  refresh?: string;
};

export async function getStoredTokens(): Promise<AuthTokenPair | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.token);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthTokenPair;
  } catch {
    return null;
  }
}

export async function setStoredTokens(token: AuthTokenPair): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.token, JSON.stringify(token));
}

export async function getStoredUser<T = Record<string, unknown>>(): Promise<T | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.currentUser);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setStoredUser(user: unknown): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
}

export async function clearAuthStorage(): Promise<void> {
  await AsyncStorage.multiRemove([STORAGE_KEYS.token, STORAGE_KEYS.currentUser]);
}

export async function getNotificationsEnabled(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.notificationsEnabled);
  if (raw == null) return true;
  return raw === 'true';
}

export async function setNotificationsEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.notificationsEnabled, enabled ? 'true' : 'false');
}

export async function getStoredFcmToken(): Promise<string | null> {
  return AsyncStorage.getItem(STORAGE_KEYS.fcmDeviceToken);
}

export async function setStoredFcmToken(token: string): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.fcmDeviceToken, token);
}

export async function clearStoredFcmToken(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.fcmDeviceToken);
}

export async function getStoredThemeScheme(): Promise<'light' | 'dark' | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.themeScheme);
  if (raw === 'light' || raw === 'dark') return raw;
  return null;
}

export async function setStoredThemeScheme(scheme: 'light' | 'dark'): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.themeScheme, scheme);
}
