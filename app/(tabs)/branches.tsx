import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DieselOverviewView } from '@/components/diesel/diesel-overview-view';
import { ReportMonthYearFields } from '@/components/reports/report-date-fields';
import { AppHeader } from '@/components/wyre/app-header';
import { UserAvatarButton } from '@/components/wyre/user-avatar-button';
import { WyreColors } from '@/constants/theme';
import {
  fetchDieselOverview,
  fetchFuelUsageSeries,
  fetchGeneratorFuelSeries,
} from '@/lib/diesel/diesel-api';
import {
  DUMMY_DIESEL_OVERVIEW,
  getMonthYear,
  isFutureMonth,
  monthLabel,
} from '@/lib/diesel/helpers';
import type { ChartFrequency, DieselOverviewState } from '@/lib/diesel/types';
import { monthLabel as reportMonthLabel } from '@/lib/report/helpers';
import { useAppSelector } from '@/redux/hooks';

const TAB_BAR_CLEARANCE = 96;

export default function BranchesScreen() {
  const insets = useSafeAreaInsets();
  const userData = useAppSelector((state) => state.auth.userData);
  const branchId =
    typeof userData?.branch_id === 'number' || typeof userData?.branch_id === 'string'
      ? userData.branch_id
      : null;

  const initial = getMonthYear();
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);
  const [fuelBreakupFrequency, setFuelBreakupFrequency] = useState<ChartFrequency>('daily');
  const [fuelUsageFrequency, setFuelUsageFrequency] = useState<ChartFrequency>('daily');

  const [data, setData] = useState<DieselOverviewState>(DUMMY_DIESEL_OVERVIEW);
  const [loading, setLoading] = useState(false);
  const [fuelBreakupLoading, setFuelBreakupLoading] = useState(false);
  const [fuelUsageLoading, setFuelUsageLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [usingSampleData, setUsingSampleData] = useState(true);

  // Keep latest frequencies available for full-page loads without re-triggering them.
  const fuelBreakupFrequencyRef = useRef(fuelBreakupFrequency);
  const fuelUsageFrequencyRef = useRef(fuelUsageFrequency);
  fuelBreakupFrequencyRef.current = fuelBreakupFrequency;
  fuelUsageFrequencyRef.current = fuelUsageFrequency;

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 8 }, (_, index) => currentYear - index);
  }, []);

  const monthOptions = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    return Array.from({ length: 12 }, (_, index) => {
      const value = index + 1;
      return {
        value,
        label: reportMonthLabel(value),
        disabled: year === currentYear && value > currentMonth,
      };
    });
  }, [year]);

  const loadOverview = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!branchId || isFutureMonth(month, year)) {
        setData(DUMMY_DIESEL_OVERVIEW);
        setUsingSampleData(true);
        return;
      }

      if (!options?.silent) setLoading(true);

      try {
        const overview = await fetchDieselOverview(
          branchId,
          month,
          year,
          fuelBreakupFrequencyRef.current,
          fuelUsageFrequencyRef.current,
        );
        setData(overview);
        setUsingSampleData(false);
      } catch {
        setData(DUMMY_DIESEL_OVERVIEW);
        setUsingSampleData(true);
      } finally {
        if (!options?.silent) setLoading(false);
      }
    },
    [branchId, month, year],
  );

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOverview({ silent: true });
    setRefreshing(false);
  };

  const onFuelBreakupFrequencyChange = async (frequency: ChartFrequency) => {
    if (frequency === fuelBreakupFrequency) return;
    setFuelBreakupFrequency(frequency);

    if (!branchId || usingSampleData) return;

    setFuelBreakupLoading(true);
    try {
      const generatorFuelSeries = await fetchGeneratorFuelSeries(
        branchId,
        month,
        year,
        frequency,
      );
      setData((prev) => ({ ...prev, generatorFuelSeries }));
    } catch {
      // Keep existing chart data on failure.
    } finally {
      setFuelBreakupLoading(false);
    }
  };

  const onFuelUsageFrequencyChange = async (frequency: ChartFrequency) => {
    if (frequency === fuelUsageFrequency) return;
    setFuelUsageFrequency(frequency);

    if (!branchId || usingSampleData) return;

    setFuelUsageLoading(true);
    try {
      const fuelUsageSeries = await fetchFuelUsageSeries(branchId, month, year, frequency);
      setData((prev) => ({ ...prev, fuelUsageSeries }));
    } catch {
      // Keep existing chart data on failure.
    } finally {
      setFuelUsageLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <AppHeader rightAction={<UserAvatarButton />} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + TAB_BAR_CLEARANCE },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={WyreColors.purple}
          />
        }
        showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <Text style={styles.screenTitle}>Diesel Overview</Text>
          <Text style={styles.screenSubtitle}>
            Generator fuel usage and efficiency for {monthLabel(month, year)}.
          </Text>
        </View>

        <View style={styles.controlsCard}>
          <ReportMonthYearFields
            month={month}
            year={year}
            onChangeMonth={setMonth}
            onChangeYear={setYear}
            monthOptions={monthOptions}
            yearOptions={yearOptions}
          />
        </View>

        {usingSampleData ? (
          <Text style={styles.sampleNote}>
            Showing sample data. Sign in with a branch account to load live diesel metrics.
          </Text>
        ) : null}

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color={WyreColors.purple} />
            <Text style={styles.loadingText}>Loading diesel overview…</Text>
          </View>
        ) : (
          <DieselOverviewView
            data={data}
            month={month}
            year={year}
            fuelBreakupFrequency={fuelBreakupFrequency}
            fuelUsageFrequency={fuelUsageFrequency}
            onFuelBreakupFrequencyChange={onFuelBreakupFrequencyChange}
            onFuelUsageFrequencyChange={onFuelUsageFrequencyChange}
            loadingSections={{
              fuelBreakup: fuelBreakupLoading,
              fuelUsage: fuelUsageLoading,
            }}
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: WyreColors.pageBg,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    gap: 14,
  },
  pageHeader: {
    gap: 4,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: WyreColors.textPrimary,
  },
  screenSubtitle: {
    fontSize: 14,
    color: WyreColors.textSecondary,
    lineHeight: 20,
  },
  controlsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ECECF3',
  },
  sampleNote: {
    fontSize: 12,
    color: WyreColors.textSecondary,
    backgroundColor: '#FFF7ED',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  loadingBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 48,
  },
  loadingText: {
    fontSize: 14,
    color: WyreColors.textSecondary,
  },
});
