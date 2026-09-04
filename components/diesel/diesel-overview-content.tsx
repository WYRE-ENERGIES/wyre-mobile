import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { DieselDetailsSheet } from '@/components/diesel/diesel-details-sheet';
import { DieselEnergySection } from '@/components/diesel/diesel-energy-section';
import { DieselHeader } from '@/components/diesel/diesel-header';
import { NoDieselAccess } from '@/components/diesel/no-diesel-access';
import { DieselStatusSection } from '@/components/diesel/diesel-status-section';
import { DieselSummaryCards } from '@/components/diesel/diesel-summary-cards';
import { DashboardScreen } from '@/components/wyre/dashboard-screen';
import { useAppTheme } from '@/context/theme-context';
import { useDieselOverview } from '@/hooks/use-diesel-overview';
import { getBranchId, isSolarCustomer } from '@/lib/auth-user';
import { useAppSelector } from '@/redux/hooks';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function DieselOverviewContent() {
  const { colors } = useAppTheme();
  const userData = useAppSelector((state) => state.auth.userData);
  const branchId = getBranchId(userData);
  const now = useMemo(() => new Date(), []);
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [seeMoreOpen, setSeeMoreOpen] = useState(false);
  const { data, loading, refreshing, error, unavailable, refresh } = useDieselOverview(
    branchId,
    month,
    year,
  );
  const noGenerators =
    unavailable ||
    (data !== null &&
      data.generators.length === 0 &&
      data.energyGenerators.length === 0 &&
      data.runtimeGenerators.length === 0);

  return (
    <DashboardScreen>
      <DieselHeader
        monthLabel={MONTHS[month - 1]}
        year={year}
        showTracker={!isSolarCustomer(userData)}
        onOpenTracker={() => router.push('/tracker-details')}
      />
      {loading && !data ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.muted, { color: colors.textOnPageMuted }]}>
            Loading generator data…
          </Text>
        </View>
      ) : noGenerators ? (
        <NoDieselAccess />
      ) : error && !data ? (
        <View style={styles.centered}>
          <Text style={[styles.errorTitle, { color: colors.textOnPage }]}>
            Diesel data is temporarily unavailable
          </Text>
          <Text style={[styles.muted, { color: colors.textOnPageMuted }]}>
            We couldn’t refresh this page. Check your connection and try again.
          </Text>
          <Pressable
            style={[styles.retry, { backgroundColor: colors.accent }]}
            onPress={() => void refresh()}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void refresh()}
              tintColor={colors.accent}
            />
          }>
          {data ? <DieselSummaryCards data={data} /> : null}
          {data ? (
            <DieselEnergySection
              totalEnergy={data.totalEnergy}
              generators={data.energyGenerators}
              month={month}
              year={year}
              onChangeMonth={setMonth}
              onChangeYear={setYear}
            />
          ) : null}
          {data ? (
            <DieselStatusSection
              generators={data.runtimeGenerators}
              totalRuntime={data.totalRuntime}
              totalFuelLiters={data.totalFuelLiters}
              onSeeMore={() => setSeeMoreOpen(true)}
            />
          ) : null}
        </ScrollView>
      )}

      <DieselDetailsSheet
        visible={seeMoreOpen}
        onClose={() => setSeeMoreOpen(false)}
        branchId={branchId}
        month={month}
        year={year}
      />
    </DashboardScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 120,
    gap: 24,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 10,
  },
  muted: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  retry: {
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
