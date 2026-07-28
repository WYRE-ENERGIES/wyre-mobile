import { Provider } from 'react-redux';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { router, Stack, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, type ReactNode } from 'react';
import 'react-native-reanimated';

import { setUnauthorizedHandler } from '@/config/api/apiServices';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { bootstrapAuth, logUserOut } from '@/redux/actions/auth/auth.action';
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
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
  const segments = useSegments();
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    dispatch(bootstrapAuth()).finally(() => setBootstrapped(true));

    setUnauthorizedHandler(() => {
      dispatch(logUserOut());
      router.replace('/(auth)/login');
    });

    return () => setUnauthorizedHandler(null);
  }, [dispatch]);

  useEffect(() => {
    if (!bootstrapped || !isHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';
    const onProtectedRoute = !inAuthGroup;

    if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
      return;
    }

    if (!isAuthenticated && onProtectedRoute) {
      router.replace('/(auth)/login');
    }
  }, [bootstrapped, isHydrated, isAuthenticated, segments]);

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
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AuthBootstrap>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen
            name="profile"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="settings"
            options={{
              presentation: 'card',
              animation: 'slide_from_right',
            }}
          />
        </Stack>
      </AuthBootstrap>
      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}
