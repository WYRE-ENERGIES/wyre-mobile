import { Redirect, router, usePathname } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CostTrackerContent } from '@/components/cost-tracker/cost-tracker-content';
import { ScorecardContent } from '@/components/scorecard/scorecard-content';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DashboardScreen } from '@/components/wyre/dashboard-screen';
import { NotificationBellButton } from '@/components/wyre/notification-bell-button';
import { useAppTheme } from '@/context/theme-context';
import { isSolarCustomer } from '@/lib/auth-user';
import { useAppSelector } from '@/redux/hooks';

type TrackerView = 'costs' | 'scorecard';

export default function TrackerScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const userData = useAppSelector((state) => state.auth.userData);
  const [view, setView] = useState<TrackerView>('costs');
  const standalone = usePathname().endsWith('/tracker-details');

  if (isSolarCustomer(userData)) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <DashboardScreen>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        {standalone ? (
          <Pressable
            accessibilityLabel="Back to Diesel"
            onPress={() => router.back()}
            style={[styles.backButton, { backgroundColor: colors.surface }]}>
            <IconSymbol name="chevron.left" size={22} color={colors.textOnPage} />
          </Pressable>
        ) : null}
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.textOnPage }]}>Tracker</Text>
          <Text style={[styles.subtitle, { color: colors.textOnPageMuted }]}>
            Costs and site performance
          </Text>
        </View>
        <NotificationBellButton />
      </View>

      <View style={[styles.tabs, { backgroundColor: colors.surface }]}>
        {(
          [
            { key: 'costs', label: 'Cost tracker' },
            { key: 'scorecard', label: 'Scorecard' },
          ] as const
        ).map((item) => {
          const selected = view === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => setView(item.key)}
              style={[
                styles.tab,
                selected && {
                  backgroundColor: isDark ? colors.surfaceMuted : colors.accent,
                },
              ]}>
              <Text
                style={[
                  styles.tabText,
                  { color: colors.textOnCardSecondary },
                  selected && { color: isDark ? colors.accent : colors.textOnAccent },
                ]}>
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.content}>
        {view === 'costs' ? <CostTrackerContent /> : <ScorecardContent />}
      </View>
    </DashboardScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerCopy: { flex: 1, gap: 3 },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { fontSize: 13 },
  tabs: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 4,
    borderRadius: 14,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    minHeight: 42,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: { fontSize: 13, fontWeight: '700' },
  content: { flex: 1 },
});
