import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { BatteryChartSection } from '@/components/solar/battery-chart-section';
import { ConsumptionChartSection } from '@/components/solar/consumption-chart-section';
import { LiveOverviewCard } from '@/components/solar/live-overview-card';
import { PvProductionChartSection } from '@/components/solar/pv-production-chart-section';
import { SiteStatusSection } from '@/components/solar/site-status-section';
import { YieldSection } from '@/components/solar/yield-section';
import { TabScreenLayout } from '@/components/wyre/tab-screen-layout';
import { WyreColors } from '@/constants/theme';
import { useSolarCharts } from '@/hooks/use-solar-charts';
import { useSolarOverview } from '@/hooks/use-solar-overview';

type SolarOverviewContentProps = {
  branchId: number;
};

export function SolarOverviewContent({ branchId }: SolarOverviewContentProps) {
  const { overview, yield: yieldData, siteStatus, loading, refreshing, error, refresh } =
    useSolarOverview(branchId);
  const charts = useSolarCharts(branchId);

  const handleRefresh = () => {
    void refresh();
    void charts.setConsumptionDate(charts.consumption.date);
    void charts.setPvProductionDate(charts.pvProduction.date);
    void charts.setBatteryDate(charts.battery.date);
  };

  if (loading && !overview) {
    return (
      <TabScreenLayout title="Solar Overview">
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={WyreColors.purple} />
          <Text style={styles.loadingText}>Loading your solar data…</Text>
        </View>
      </TabScreenLayout>
    );
  }

  if (error && !overview) {
    return (
      <TabScreenLayout title="Solar Overview">
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Unable to load overview</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => void refresh()}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </Pressable>
        </View>
      </TabScreenLayout>
    );
  }

  return (
    <TabScreenLayout title="Solar Overview">
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={WyreColors.purple}
            colors={[WyreColors.purple]}
          />
        }>
        {overview ? (
          <LiveOverviewCard data={overview} battery={siteStatus?.battery ?? null} />
        ) : null}
        {siteStatus ? <SiteStatusSection data={siteStatus} /> : null}
        {yieldData ? <YieldSection data={yieldData} /> : null}

        <ConsumptionChartSection
          data={charts.consumption.data}
          loading={charts.consumption.loading}
          error={charts.consumption.error}
          date={charts.consumption.date}
          onDateChange={charts.setConsumptionDate}
        />
        <PvProductionChartSection
          data={charts.pvProduction.data}
          loading={charts.pvProduction.loading}
          error={charts.pvProduction.error}
          date={charts.pvProduction.date}
          onDateChange={charts.setPvProductionDate}
        />
        <BatteryChartSection
          data={charts.battery.data}
          loading={charts.battery.loading}
          error={charts.battery.error}
          date={charts.battery.date}
          onDateChange={charts.setBatteryDate}
        />

        {error ? <Text style={styles.inlineError}>{error}</Text> : null}
      </ScrollView>
    </TabScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: 16,
    paddingBottom: 32,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 48,
  },
  loadingText: {
    fontSize: 15,
    color: WyreColors.textSecondary,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: WyreColors.textPrimary,
  },
  errorMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: WyreColors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 8,
    backgroundColor: WyreColors.purple,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  inlineError: {
    fontSize: 13,
    color: WyreColors.error,
    textAlign: 'center',
  },
});
