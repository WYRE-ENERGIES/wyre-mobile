import { Redirect } from 'expo-router';

import { getDefaultTabsHref } from '@/lib/auth-user';
import { useAppSelector } from '@/redux/hooks';

export default function Index() {
  const { isAuthenticated, isHydrated, userData } = useAppSelector((state) => state.auth);

  if (!isHydrated) {
    return null;
  }

  if (isAuthenticated) {
    return <Redirect href={getDefaultTabsHref(userData)} />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
