import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EnergyUsageRing } from '@/components/solar/energy-usage-ring';
import { NoSolarAccess } from '@/components/solar/no-solar-access';
import { SiteStatusCard } from '@/components/solar/site-status-card';
import { SiteStatusEnlargeSheet } from '@/components/solar/site-status-enlarge-sheet';
import { SolarHomeHeader } from '@/components/solar/solar-home-header';
import { SourcesDetailSheet } from '@/components/solar/sources-detail-sheet';
import { SourcesGrid } from '@/components/solar/sources-grid';
import { DashboardScreen } from '@/components/wyre/dashboard-screen';
import { useAppTheme } from '@/context/theme-context';
import { useSiteCapabilities } from '@/context/site-capability-context';
import { useSolarOverview } from '@/hooks/use-solar-overview';
import { getBranchId } from '@/lib/auth-user';
import { getBranchLabel, getUserDisplayName } from '@/lib/user-display';
import type { YieldTabKey } from '@/lib/solar-types';
import { useAppSelector } from '@/redux/hooks';

function SolarDashboard({ children }: { children: ReactNode }) {
  return (
    <DashboardScreen
      darkGradientColors={['#090513', '#270850', '#08020E']}
      darkGradientLocations={[0, 0.48, 1]}>
      {children}
    </DashboardScreen>
  );
}

export function SolarHomeContent() {
  const { colors } = useAppTheme();
  const userData = useAppSelector((state) => state.auth.userData);
  const { hasSolar } = useSiteCapabilities();
  const branchId = getBranchId(userData);
  const branchLabel = getBranchLabel(userData);
  const siteName =
    branchLabel && !branchLabel.startsWith('Branch #')
      ? branchLabel
      : getUserDisplayName(userData);
  const { overview, yield: yieldData, siteStatus, loading, refreshing, error, refresh } =
    useSolarOverview(hasSolar ? branchId : null);

  const [selected, setSelected] = useState<YieldTabKey>('load');
  const [seeMoreOpen, setSeeMoreOpen] = useState(false);
  const [enlargeOpen, setEnlargeOpen] = useState(false);

  if (!hasSolar) {
    return (
      <SolarDashboard>
        <SolarHomeHeader siteName={siteName} />
        <NoSolarAccess />
      </SolarDashboard>
    );
  }

  if (!branchId) {
    return (
      <SolarDashboard>
        <SolarHomeHeader siteName={siteName} />
        <View style={styles.centered}>
          <Text style={[styles.errorTitle, { color: colors.textOnPage }]}>Site not linked</Text>
          <Text style={[styles.errorMessage, { color: colors.textOnPageMuted }]}>
            Your account does not have a site linked yet. Please contact Wyre support.
          </Text>
        </View>
      </SolarDashboard>
    );
  }

  if (loading && !overview) {
    return (
      <SolarDashboard>
        <SolarHomeHeader siteName={siteName} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textOnPageMuted }]}>
            Loading your solar data…
          </Text>
        </View>
      </SolarDashboard>
    );
  }

  if (error && !overview) {
    return (
      <SolarDashboard>
        <SolarHomeHeader siteName={siteName} />
        <View style={styles.centered}>
          <Text style={[styles.errorTitle, { color: colors.textOnPage }]}>
            Unable to load overview
          </Text>
          <Text style={[styles.errorMessage, { color: colors.textOnPageMuted }]}>{error}</Text>
          <Pressable
            style={[styles.retry, { backgroundColor: colors.accent }]}
            onPress={() => void refresh()}>
            <Text style={styles.retryText}>Try again</Text>
          </Pressable>
        </View>
      </SolarDashboard>
    );
  }

  return (
    <SolarDashboard>
      <SolarHomeHeader siteName={siteName} />
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
        {overview ? (
          <EnergyUsageRing
            usagePercent={overview.metrics.percentage_usage}
            installedKwp={overview.metrics.installed_capacity_kWp}
            productionKw={overview.metrics.pv_production_kw}
            battery={siteStatus?.battery ?? null}
          />
        ) : null}

        {yieldData ? (
          <SourcesGrid
            data={yieldData}
            selected={selected}
            onSelect={setSelected}
            onSeeMore={() => setSeeMoreOpen(true)}
          />
        ) : null}

        {siteStatus ? (
          <SiteStatusCard data={siteStatus} onEnlarge={() => setEnlargeOpen(true)} />
        ) : null}
      </ScrollView>

      <SourcesDetailSheet
        visible={seeMoreOpen}
        onClose={() => setSeeMoreOpen(false)}
        selected={selected}
        yieldData={yieldData}
        branchId={branchId}
      />
      <SiteStatusEnlargeSheet
        visible={enlargeOpen}
        onClose={() => setEnlargeOpen(false)}
        data={siteStatus}
      />
    </SolarDashboard>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingTop: 18,
    paddingBottom: 120,
    gap: 22,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 10,
  },
  loadingText: {
    fontSize: 15,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  errorMessage: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  retry: {
    marginTop: 8,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
