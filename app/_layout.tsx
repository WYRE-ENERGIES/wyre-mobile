import { Provider } from 'react-redux';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, type ReactNode } from 'react';
import 'react-native-reanimated';

import { setUnauthorizedHandler } from '@/config/api/apiServices';
import { AppThemeProvider, useAppTheme } from '@/context/theme-context';
import {
  attachExpoNotificationInboxListeners,
  configureNotificationPresentation,
} from '@/lib/notification-delivery';
import { handleNotificationOpen } from '@/lib/notification-routing';
import { getDefaultTabsHref } from '@/lib/auth-user';
import {
  attachPushListeners,
  registerCurrentDeviceForPush,
} from '@/lib/push-notifications';
import { bootstrapAuth } from '@/redux/actions/auth/auth.action';
import { logoutUser } from '@/redux/actions/auth/auth.creator';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { store } from '@/redux/store';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash may already be hidden in fast refresh.
});

export const unstable_settings = {
  anchor: '(auth)',
  initialRouteName: '(auth)',
};

function AuthBootstrap({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isHydrated, userData } = useAppSelector((state) => state.auth);
  const segments = useSegments();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    dispatch(bootstrapAuth()).finally(() => setBootstrapped(true));

    setUnauthorizedHandler(() => {
      dispatch(logoutUser());
      router.replace('/(auth)/login');
    });

    return () => setUnauthorizedHandler(null);
  }, [dispatch]);

  useEffect(() => {
    configureNotificationPresentation();
  }, []);

  useEffect(() => {
    if (!bootstrapped || !isHydrated || !isAuthenticated) return;

    let detachPush: (() => void) | undefined;
    let detachExpo: (() => void) | undefined;

    const setupPush = async () => {
      await registerCurrentDeviceForPush();
      detachPush = attachPushListeners({
        onNotificationOpened: (data) => {
          handleNotificationOpen(data);
        },
      });
      detachExpo = attachExpoNotificationInboxListeners();
    };

    setupPush().catch(() => undefined);

    return () => {
      detachPush?.();
      detachExpo?.();
    };
  }, [bootstrapped, isHydrated, isAuthenticated]);

  useEffect(() => {
    if (!bootstrapped || !isHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';
    const onProtectedRoute = !inAuthGroup;

    if (isAuthenticated && inAuthGroup) {
      router.replace(getDefaultTabsHref(userData));
      return;
    }

    if (!isAuthenticated && onProtectedRoute) {
      router.replace('/(auth)/welcome');
    }
  }, [bootstrapped, isHydrated, isAuthenticated, segments, userData]);

  useEffect(() => {
    if (!bootstrapped || !isHydrated) return;

    // Logged-in users skip the login handoff — hide the native splash here.
    if (isAuthenticated) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [bootstrapped, isHydrated, isAuthenticated]);

  if (!bootstrapped || !isHydrated) {
    return null;
  }

  return <>{children}</>;
}

function RootNavigator() {
  const { isDark } = useAppTheme();

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <AuthBootstrap>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="settings"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="alerts"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="tracker-details"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="notification/[id]"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
        </Stack>
      </AuthBootstrap>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AppThemeProvider>
        <RootNavigator />
      </AppThemeProvider>
    </Provider>
  );
}
