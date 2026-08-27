import { Redirect } from 'expo-router';

import { SolarHomeContent } from '@/components/solar/solar-home-content';
import { useSiteCapabilities } from '@/context/site-capability-context';

export default function HomeScreen() {
  const { hasSolar, checkingSolar } = useSiteCapabilities();
  if (checkingSolar) return null;
  if (!hasSolar) {
    return <Redirect href="/(tabs)/branches" />;
  }
  return <SolarHomeContent />;
}
