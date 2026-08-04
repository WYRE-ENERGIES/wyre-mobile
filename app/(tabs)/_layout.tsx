import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { ComponentProps } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WyreColors } from '@/constants/theme';
import { useAppSelector } from '@/redux/hooks';

const TAB_INACTIVE = '#6b7280';
const TAB_BAR_BASE_HEIGHT = 56;

function AndroidTabIcon({
  name,
  color,
  size,
}: {
  name: ComponentProps<typeof MaterialIcons>['name'];
  color: string;
  size: number;
}) {
  return <MaterialIcons name={name} size={size} color={color} />;
}

function IosNativeTabs() {
  return (
    <NativeTabs
      backgroundColor="#FFFFFF"
      blurEffect="systemChromeMaterialLight"
      disableTransparentOnScrollEdge
      shadowColor="rgba(15, 23, 42, 0.12)"
      tintColor={WyreColors.purple}
      iconColor={{
        default: TAB_INACTIVE,
        selected: WyreColors.purple,
      }}
      labelStyle={{
        default: { color: TAB_INACTIVE, fontSize: 10, fontWeight: '600' },
        selected: { color: WyreColors.purple, fontSize: 10, fontWeight: '600' },
      }}
      minimizeBehavior="never">
      <NativeTabs.Trigger name="index">
        <Icon
          sf={{ default: 'square.grid.3x3', selected: 'square.grid.3x3.fill' }}
          selectedColor={WyreColors.purple}
        />
        <Label>Solar</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="branches">
        <Icon
          sf={{ default: 'fuelpump', selected: 'fuelpump.fill' }}
          selectedColor={WyreColors.purple}
        />
        <Label>Diesel</Label>
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

function AndroidTabs() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = TAB_BAR_BASE_HEIGHT + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: WyreColors.purple,
        tabBarInactiveTintColor: TAB_INACTIVE,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: WyreColors.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          height: tabBarHeight,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <AndroidTabIcon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="branches"
        options={{
          title: 'Branches',
          tabBarIcon: ({ color, size }) => (
            <AndroidTabIcon name="business" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <AndroidTabIcon name="notifications" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'Reports',
          tabBarIcon: ({ color, size }) => (
            <AndroidTabIcon name="bar-chart" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);

  if (!isHydrated || !isAuthenticated) {
    return null;
  }

  // NativeTabs are SF Symbol–driven and can fail to paint a tab bar on Android
  // (especially in Expo Go). Keep NativeTabs on iOS; use React Navigation tabs
  // on Android for the same Home / Branches / Alerts / Reports destinations.
  if (Platform.OS === 'ios') {
    return <IosNativeTabs />;
  }

  return <AndroidTabs />;
}
