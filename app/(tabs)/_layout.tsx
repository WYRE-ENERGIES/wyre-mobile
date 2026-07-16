import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';

import { WyreColors } from '@/constants/theme';
import { useAppSelector } from '@/redux/hooks';

export default function TabLayout() {
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);

  if (!isHydrated || !isAuthenticated) {
    return null;
  }

  return (
    <NativeTabs
      backgroundColor="#FFFFFF"
      blurEffect="systemChromeMaterialLight"
      disableTransparentOnScrollEdge
      shadowColor="rgba(15, 23, 42, 0.12)"
      tintColor={WyreColors.purple}
      iconColor={{
        default: '#6b7280',
        selected: WyreColors.purple,
      }}
      labelStyle={{
        default: { color: '#6b7280', fontSize: 10, fontWeight: '600' },
        selected: { color: WyreColors.purple, fontSize: 10, fontWeight: '600' },
      }}
      minimizeBehavior="never">
      <NativeTabs.Trigger name="index">
        <Icon
          sf={{ default: 'house', selected: 'house.fill' }}
          selectedColor={WyreColors.purple}
        />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="branches">
        <Icon
          sf={{ default: 'building.2', selected: 'building.2.fill' }}
          selectedColor={WyreColors.purple}
        />
        <Label>Branches</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="alerts">
        <Icon
          sf={{ default: 'bell', selected: 'bell.fill' }}
          selectedColor={WyreColors.purple}
        />
        <Label>Alerts</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="reports">
        <Icon
          sf={{ default: 'chart.bar', selected: 'chart.bar.fill' }}
          selectedColor={WyreColors.purple}
        />
        <Label>Reports</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
