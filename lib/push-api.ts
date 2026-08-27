import { Platform } from 'react-native';

import { APIService, APIServiceNoAuth } from '@/config/api/apiServices';

export type DeviceTokenPayload = {
  token: string;
  platform: 'ios' | 'android';
};

export type PushConfig = {
  android_push_ready: boolean;
  ios_push_ready: boolean;
};

const DEFAULT_PUSH_CONFIG: PushConfig = {
  android_push_ready: true,
  ios_push_ready: false,
};

export async function fetchPushConfig(): Promise<PushConfig> {
  try {
    const response = await APIServiceNoAuth.get('notifications/config/');
    const data = response.data ?? {};
    return {
      android_push_ready: data.android_push_ready !== false,
      ios_push_ready: data.ios_push_ready === true,
    };
  } catch (error) {
    if (__DEV__) {
      console.warn('[FCM] fetchPushConfig failed — using defaults', error);
    }
    return DEFAULT_PUSH_CONFIG;
  }
}

export async function registerDeviceToken(payload: DeviceTokenPayload): Promise<void> {
  await APIService.post('notifications/devices/', payload);
  if (__DEV__) {
    console.log('[FCM] Registered device token', {
      platform: payload.platform,
      tokenPreview: `${payload.token.slice(0, 12)}…`,
    });
  }
}

export async function unregisterDeviceToken(payload: DeviceTokenPayload): Promise<void> {
  const encoded = encodeURIComponent(payload.token);
  await APIService.delete(`notifications/devices/${encoded}/`);
  if (__DEV__) {
    console.log('[FCM] Unregistered device token', {
      platform: payload.platform,
      tokenPreview: `${payload.token.slice(0, 12)}…`,
    });
  }
}

export function getPushPlatform(): 'ios' | 'android' | null {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    return Platform.OS;
  }
  return null;
}
