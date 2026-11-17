import Head from 'expo-router/head';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/context/theme-context';

/**
 * Web-only PWA glue:
 * - registers /sw.js in production builds only,
 * - shows an "update available" bar when a new service worker is waiting
 *   (otherwise the new version activates on the next launch),
 * - shows a "You're offline" bar while the browser reports no connection.
 */
export function PwaSupport() {
  const { colors } = useAppTheme();
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    if (typeof navigator === 'undefined') return;

    setOffline(navigator.onLine === false);
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);

    let cancelled = false;
    if (!__DEV__ && 'serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          if (cancelled) return;
          const track = (worker: ServiceWorker | null) => {
            if (!worker) return;
            worker.addEventListener('statechange', () => {
              if (worker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaiting(worker);
              }
            });
          };
          if (registration.waiting && navigator.serviceWorker.controller) {
            setWaiting(registration.waiting);
          }
          track(registration.installing);
          registration.addEventListener('updatefound', () => track(registration.installing));
          // Check for a new version whenever the app comes back to the foreground.
          document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') registration.update().catch(() => undefined);
          });
        })
        .catch(() => undefined);
    }

    return () => {
      cancelled = true;
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  const applyUpdate = () => {
    if (!waiting) return;
    navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), {
      once: true,
    });
    waiting.postMessage({ type: 'SKIP_WAITING' });
  };

  const title = (
    <Head>
      <title>Wyre</title>
    </Head>
  );

  if (!offline && !waiting) return title;

  return (
    <View pointerEvents="box-none" style={styles.host}>
      {title}
      {offline ? (
        <View style={[styles.bar, { backgroundColor: colors.textOnCard }]}>
          <Text style={[styles.text, { color: colors.surface }]}>
            You&apos;re offline. Data will refresh when you reconnect.
          </Text>
        </View>
      ) : null}
      {waiting ? (
        <View style={[styles.bar, { backgroundColor: colors.accent }]}>
          <Text style={[styles.text, styles.onAccent]}>A new version of Wyre is available.</Text>
          <Pressable onPress={applyUpdate} style={styles.button} accessibilityRole="button">
            <Text style={[styles.text, styles.onAccent, styles.buttonText]}>Refresh</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 12,
    right: 12,
    top: 'calc(env(safe-area-inset-top, 0px) + 8px)' as unknown as number,
    gap: 8,
    zIndex: 1000,
  },
  bar: {
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    flexShrink: 1,
  },
  onAccent: {
    color: '#FFFFFF',
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  buttonText: {
    fontWeight: '700',
  },
});
