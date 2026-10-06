import { Redirect, Tabs, usePathname } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { useMemo, useRef } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { UserAvatar } from '@/components/wyre/user-avatar';
import { useAppTheme } from '@/context/theme-context';
import {
  SiteCapabilityProvider,
  useSiteCapabilities,
} from '@/context/site-capability-context';
import { useAppSelector } from '@/redux/hooks';

type TabIconProps = {
  color: string;
  focused: boolean;
  size: number;
};

const STANDARD_ICON_SIZE = Platform.OS === 'android' ? 24 : 28;
const ROUND_ICON_SIZE = Platform.OS === 'android' ? 26 : 30;
const SOLAR_SYMBOL = {
  default: 'square.grid.3x3',
  selected: 'square.grid.3x3.fill',
} as const;
const DIESEL_SYMBOL = { default: 'fuelpump', selected: 'fuelpump.fill' } as const;
const TRACKER_SYMBOL = {
  default: 'chart.line.uptrend.xyaxis',
  selected: 'chart.line.uptrend.xyaxis',
} as const;
const TARGET_SYMBOL = { default: 'plus.circle', selected: 'plus.circle.fill' } as const;
const REPORTS_SYMBOL = { default: 'chart.bar', selected: 'chart.bar.fill' } as const;
const PROFILE_SYMBOL = {
  default: 'person.crop.circle',
  selected: 'person.crop.circle.fill',
} as const;

const solarIcon = ({ color, focused }: TabIconProps) => (
  <IconSymbol
    name={focused ? 'square.grid.3x3.fill' : 'square.grid.3x3'}
    color={color}
    size={STANDARD_ICON_SIZE}
    weight={focused ? 'semibold' : 'regular'}
  />
);
const dieselIcon = ({ color, focused }: TabIconProps) => (
  <IconSymbol
    name={focused ? 'fuelpump.fill' : 'fuelpump'}
    color={color}
    size={STANDARD_ICON_SIZE}
    weight={focused ? 'semibold' : 'regular'}
  />
);
const reportsIcon = ({ color, focused }: TabIconProps) => (
  <IconSymbol
    name={focused ? 'chart.bar.fill' : 'chart.bar'}
    color={color}
    size={STANDARD_ICON_SIZE}
    weight={focused ? 'semibold' : 'regular'}
  />
);
const trackerIcon = ({ color, focused }: TabIconProps) => (
  <IconSymbol
    name="chart.line.uptrend.xyaxis"
    color={color}
    size={STANDARD_ICON_SIZE}
    weight={focused ? 'semibold' : 'regular'}
  />
);

function TargetTabIcon({ color, focused }: TabIconProps) {
  const { isDark } = useAppTheme();
  const activeColor = isDark ? '#6E11CB' : '#5C12A7';

  return (
    <View
      style={[
        styles.targetIcon,
        {
          width: ROUND_ICON_SIZE,
          height: ROUND_ICON_SIZE,
          borderRadius: ROUND_ICON_SIZE / 2,
          borderColor: focused ? activeColor : color,
          backgroundColor: focused ? activeColor : 'transparent',
        },
      ]}>
      <IconSymbol
        name="plus"
        color={focused ? '#FFFFFF' : color}
        size={Platform.OS === 'android' ? 19 : 22}
      />
    </View>
  );
}

function ProfileTabIcon() {
  const userData = useAppSelector((state) => state.auth.userData);
  return <UserAvatar userData={userData} size={ROUND_ICON_SIZE} bordered={false} />;
}

const targetIcon = (props: TabIconProps) => <TargetTabIcon {...props} />;
const profileIcon = () => <ProfileTabIcon />;

function TabNavigator() {
  const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
  const { hasSolar, checkingSolar } = useSiteCapabilities();
  const pathname = usePathname();
  const initialNavigationHandled = useRef(false);
  const { colors, isDark } = useAppTheme();
  const nativeTint = isDark ? '#6E11CB' : '#5C12A7';
  const nativeIconColor = useMemo(
    () => ({ default: colors.icon, selected: nativeTint }),
    [colors.icon, nativeTint],
  );
  const nativeLabelStyle = useMemo(
    () => ({
      default: { color: colors.icon, fontSize: 10, fontWeight: '600' as const },
      selected: { color: nativeTint, fontSize: 10, fontWeight: '600' as const },
    }),
    [colors.icon, nativeTint],
  );
  const screenOptions = useMemo(
    () => ({
      headerShown: false,
      tabBarActiveTintColor: colors.accent,
      tabBarInactiveTintColor: colors.icon,
      tabBarStyle: {
        backgroundColor: colors.tabBarBg,
        borderTopColor: colors.border,
        paddingTop: 6,
        paddingBottom: 20,
        minHeight: 84,
      },
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: '600' as const,
        marginTop: Platform.OS === 'android' ? 0 : 1,
      },
      tabBarIconStyle: {
        marginBottom: Platform.OS === 'android' ? 1 : 4,
      },
    }),
    [colors],
  );

  if (!isHydrated || !isAuthenticated) {
    return null;
  }

  if (checkingSolar) {
    return (
      <View style={[styles.capabilityLoading, { backgroundColor: colors.pageBg }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  if (!initialNavigationHandled.current) {
    initialNavigationHandled.current = true;

    if (hasSolar && pathname.endsWith('/branches')) {
      return <Redirect href="/(tabs)" />;
    }

    if (!hasSolar && (pathname === '/' || pathname.endsWith('/index'))) {
      return <Redirect href="/(tabs)/branches" />;
    }
  }

  if (Platform.OS === 'ios') {
    if (!hasSolar) {
      return (
        <NativeTabs
          tintColor={nativeTint}
          iconColor={nativeIconColor}
          labelStyle={nativeLabelStyle}
          minimizeBehavior="never">
          <NativeTabs.Trigger name="branches">
            <Icon sf={DIESEL_SYMBOL} selectedColor={nativeTint} />
            <Label>Diesel</Label>
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="tracker">
            <Icon sf={TRACKER_SYMBOL} selectedColor={nativeTint} />
            <Label>Tracker</Label>
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="target">
            <Icon sf={TARGET_SYMBOL} selectedColor={nativeTint} />
            <Label>Target</Label>
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="reports">
            <Icon sf={REPORTS_SYMBOL} selectedColor={nativeTint} />
            <Label>Reports</Label>
          </NativeTabs.Trigger>
          <NativeTabs.Trigger name="profile">
            <Icon sf={PROFILE_SYMBOL} selectedColor={nativeTint} />
            <Label>Profile</Label>
          </NativeTabs.Trigger>
        </NativeTabs>
      );
    }

    return (
      <NativeTabs
        tintColor={nativeTint}
        iconColor={nativeIconColor}
        labelStyle={nativeLabelStyle}
        minimizeBehavior="never">
        <NativeTabs.Trigger name="index">
          <Icon sf={SOLAR_SYMBOL} selectedColor={nativeTint} />
          <Label>Solar</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="branches">
          <Icon sf={DIESEL_SYMBOL} selectedColor={nativeTint} />
          <Label>Diesel</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="target">
          <Icon sf={TARGET_SYMBOL} selectedColor={nativeTint} />
          <Label>Target</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="reports">
          <Icon sf={REPORTS_SYMBOL} selectedColor={nativeTint} />
          <Label>Reports</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <Icon sf={PROFILE_SYMBOL} selectedColor={nativeTint} />
          <Label>Profile</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Solar', tabBarIcon: solarIcon, href: hasSolar ? undefined : null }}
      />
      <Tabs.Screen name="branches" options={{ title: 'Diesel', tabBarIcon: dieselIcon }} />
      <Tabs.Screen
        name="tracker"
        options={{
          title: 'Tracker',
          tabBarIcon: trackerIcon,
          href: hasSolar ? null : undefined,
        }}
      />
      <Tabs.Screen name="target" options={{ title: 'Target', tabBarIcon: targetIcon }} />
      <Tabs.Screen name="reports" options={{ title: 'Reports', tabBarIcon: reportsIcon }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: profileIcon }} />
    </Tabs>
  );
}

export default function TabLayout() {
  return (
    <SiteCapabilityProvider>
      <TabNavigator />
    </SiteCapabilityProvider>
  );
}

const styles = StyleSheet.create({
  capabilityLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetIcon: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
