import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ScorecardMetricCard } from '@/components/scorecard/scorecard-metric-card';
import { ScorecardSummary } from '@/components/scorecard/scorecard-summary';
import { AccountScreen } from '@/components/wyre/account-screen';
import { WyreColors } from '@/constants/theme';
import { useScorecard } from '@/hooks/use-scorecard';
import { getBranchId } from '@/lib/auth-user';
import { useAppSelector } from '@/redux/hooks';

export function ScorecardContent() {
  const userData = useAppSelector((state) => state.auth.userData);
  const branchId = getBranchId(userData);
  const { metrics, loading, refreshing, error, dateLabel, refresh } = useScorecard(branchId);

  if (loading && metrics.length === 0) {
    return (
      <AccountScreen title="Scorecard">
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={WyreColors.purple} />
          <Text style={styles.loadingText}>Loading scorecard…</Text>
        </View>
      </AccountScreen>
    );
  }

  if (error && metrics.length === 0) {
    return (
      <AccountScreen title="Scorecard">
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Unable to load scorecard</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={() => void refresh()}>
            <Text style={styles.retryButtonText}>Try again</Text>
          </Pressable>
        </View>
      </AccountScreen>
    );
  }

  return (
    <AccountScreen
      title="Scorecard"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void refresh()}
          tintColor={WyreColors.purple}
          colors={[WyreColors.purple]}
        />
      }>
      <ScorecardSummary metrics={metrics} dateLabel={dateLabel} />

      <View style={styles.list}>
        {metrics.map((metric) => (
          <ScorecardMetricCard key={metric.key} metric={metric} />
        ))}
      </View>

      {error ? <Text style={styles.inlineError}>{error}</Text> : null}
    </AccountScreen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  centered: {
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
