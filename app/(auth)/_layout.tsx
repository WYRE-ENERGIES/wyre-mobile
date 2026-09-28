import { Stack } from 'expo-router';

import { useAppTheme } from '@/context/theme-context';

export default function AuthLayout() {
  const { isDark } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        contentStyle: { backgroundColor: isDark ? '#05010A' : '#F4F2F8' },
      }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="splash" />
      <Stack.Screen name="login" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
