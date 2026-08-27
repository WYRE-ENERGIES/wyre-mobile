import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { ScorecardMetricCard } from '@/components/scorecard/scorecard-metric-card';
import { ScorecardSummary } from '@/components/scorecard/scorecard-summary';
import { useAppTheme } from '@/context/theme-context';
import { useScorecard } from '@/hooks/use-scorecard';
import { getBranchId } from '@/lib/auth-user';
import { useAppSelector } from '@/redux/hooks';

export function ScorecardContent() {
  const { colors } = useAppTheme();
  const userData = useAppSelector((state) => state.auth.userData);
  const branchId = getBranchId(userData);
  const { metrics, loading, refreshing, error, dateLabel, refresh } = useScorecard(branchId);

  if (loading && metrics.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.textOnPageMuted }]}>
          Loading scorecard…
        </Text>
      </View>
    );
  }

  if (error && metrics.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={[styles.errorTitle, { color: colors.textOnPage }]}>
          Unable to load scorecard
        </Text>
        <Text style={[styles.errorMessage, { color: colors.textOnPageMuted }]}>
          Performance metrics could not be loaded right now.
        </Text>
        <Pressable
          style={[styles.retryButton, { backgroundColor: colors.accent }]}
          onPress={() => void refresh()}>
          <Text style={styles.retryButtonText}>Try again</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void refresh()}
          tintColor={colors.accent}
          colors={[colors.accent]}
        />
      }>
      <ScorecardSummary metrics={metrics} dateLabel={dateLabel} />

      <View style={styles.list}>
        {metrics.map((metric) => (
          <ScorecardMetricCard key={metric.key} metric={metric} />
        ))}
      </View>

      {error ? <Text style={[styles.inlineError, { color: colors.error }]}>{error}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingBottom: 120,
    gap: 12,
  },
  list: {
    gap: 12,
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
  retryButton: {
    marginTop: 8,
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
    textAlign: 'center',
  },
});
