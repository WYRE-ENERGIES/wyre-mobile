import { Redirect } from 'expo-router';

import { useAppSelector } from '@/redux/hooks';

export default function Index() {
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);

  if (!isHydrated) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
