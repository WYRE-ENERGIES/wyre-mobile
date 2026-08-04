import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CostTrackerActions } from '@/components/cost-tracker/cost-tracker-actions';
import { CostTrackerBaselineChart } from '@/components/cost-tracker/cost-tracker-baseline-chart';
import { CostTrackerMonthlyChart } from '@/components/cost-tracker/cost-tracker-monthly-chart';
import { CostTrackerTable, type TableColumn } from '@/components/cost-tracker/cost-tracker-table';
import { DieselDetailModal } from '@/components/cost-tracker/diesel-detail-modal';
import { SectionCard } from '@/components/solar/section-card';
import { AccountScreen } from '@/components/wyre/account-screen';
import { WyreColors } from '@/constants/theme';
import { useCostTracker } from '@/hooks/use-cost-tracker';
import { getBranchId } from '@/lib/auth-user';
import {
  buildMonthlyCostSeries,
  dieselPurchaseAmount,
  flattenBaseline,
  sortByDateDesc,
} from '@/lib/cost-tracker-transform';
import type {
  DieselOverviewRow,
  DieselPurchase,
  UtilityOverviewRow,
  UtilityPurchase,
} from '@/lib/cost-tracker-types';
import { formatKwh, formatLitres, formatNgn, formatNumber } from '@/lib/format';
import { getUserId, getUserRoleLabel } from '@/lib/user-display';
import { useAppSelector } from '@/redux/hooks';

const dieselOverviewColumns: TableColumn<DieselOverviewRow>[] = [
  { key: 'month', title: 'Month', width: 110 },
  {
    key: 'inputted_usage',
    title: 'Input (L)',
    width: 90,
    align: 'right',
    render: (row) => formatLitres(row.inputted_usage),
  },
  {
    key: 'forecasted_usage',
    title: 'Forecast (L)',
    width: 100,
    align: 'right',
    render: (row) => formatLitres(row.forecasted_usage),
  },
  {
    key: 'inputted_cost',
    title: 'Input (₦)',
    width: 100,
    align: 'right',
    render: (row) => formatNgn(row.inputted_cost),
  },
  {
    key: 'forecasted_cost',
    title: 'Forecast (₦)',
    width: 110,
    align: 'right',
    render: (row) => formatNgn(row.forecasted_cost),
  },
  {
    key: 'diesel_difference',
    title: 'Diff (L)',
    width: 90,
    align: 'right',
    render: (row) => formatLitres(row.diesel_difference),
  },
  {
    key: 'cost_difference',
    title: 'Diff (₦)',
    width: 100,
    align: 'right',
    render: (row) => formatNgn(row.cost_difference),
  },
  {
    key: 'percentage_usage',
    title: 'Diff (%)',
    width: 80,
    align: 'right',
    render: (row) => formatNumber(row.percentage_usage, 1),
  },
];

const utilityOverviewColumns: TableColumn<UtilityOverviewRow>[] = [
  { key: 'month', title: 'Month', width: 100 },
  {
    key: 'purchased_kwh',
    title: 'Purchased (kWh)',
    width: 110,
    align: 'right',
    render: (row) => formatKwh(row.purchased_kwh),
  },
  {
    key: 'energy_consumed_kwh',
    title: 'Consumed (kWh)',
    width: 110,
    align: 'right',
    render: (row) => formatKwh(row.energy_consumed_kwh),
  },
  {
    key: 'purchased_naira',
    title: 'Purchased (₦)',
    width: 110,
    align: 'right',
    render: (row) => formatNgn(row.purchased_naira),
  },
  {
    key: 'energy_consumed_naira',
    title: 'Consumed (₦)',
    width: 110,
    align: 'right',
    render: (row) => formatNgn(row.energy_consumed_naira),
  },
  {
    key: 'difference_kwh',
    title: 'Diff (kWh)',
    width: 100,
    align: 'right',
    render: (row) => formatKwh(row.difference_kwh),
  },
  {
    key: 'difference_naira',
    title: 'Diff (₦)',
    width: 100,
    align: 'right',
    render: (row) => formatNgn(row.difference_naira),
  },
  {
    key: 'percentage',
    title: 'Diff (%)',
    width: 80,
    align: 'right',
    render: (row) => formatNumber(row.percentage, 1),
  },
];

const dieselPurchasedColumns: TableColumn<DieselPurchase & { amount: number }>[] = [
  { key: 'date', title: 'Date', width: 110 },
  {
    key: 'quantity',
    title: 'Quantity (L)',
    width: 100,
    align: 'right',
    render: (row) => formatLitres(row.quantity),
  },
  {
    key: 'price_per_litre',
    title: 'Tariff (₦/L)',
    width: 100,
    align: 'right',
    render: (row) => formatNgn(row.price_per_litre),
  },
  {
    key: 'amount',
    title: 'Amount (₦)',
    width: 110,
    align: 'right',
    render: (row) => formatNgn(row.amount),
  },
];

const utilityPurchasedColumns: TableColumn<UtilityPurchase>[] = [
  { key: 'date', title: 'Date', width: 110 },
  {
    key: 'value',
    title: 'Unit (kWh)',
    width: 100,
    align: 'right',
    render: (row) => formatKwh(row.value),
  },
  {
    key: 'tarrif',
    title: 'Tariff (₦/kWh)',
    width: 110,
    align: 'right',
    render: (row) => formatNgn(row.tarrif),
  },
  {
    key: 'amount',
    title: 'Amount (₦)',
    width: 100,
    align: 'right',
    render: (row) => formatNgn(row.amount),
  },
  {
    key: 'vat_inclusive_amount',
    title: 'VAT incl. (₦)',
    width: 110,
    align: 'right',
    render: (row) => formatNgn(row.vat_inclusive_amount),
  },
];

export function CostTrackerContent() {
  const userData = useAppSelector((state) => state.auth.userData);
  const branchId = getBranchId(userData);
  const userId = getUserId(userData);
  const isOperator = getUserRoleLabel(userData) === 'OPERATOR';
  const { data, loading, refreshing, error, refresh } = useCostTracker(branchId);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);

  const branchName = data?.overview.branch_name ?? 'your site';
  const dieselPurchases = useMemo(
    () =>
      sortByDateDesc(data?.overview.branch_data?.diesel ?? []).map((row) => ({
        ...row,
        amount: dieselPurchaseAmount(row),
      })),
    [data?.overview.branch_data?.diesel],
  );
  const utilityPurchases = useMemo(
    () => sortByDateDesc(data?.overview.branch_data?.utility ?? []),
    [data?.overview.branch_data?.utility],
  );
  const monthlyCostPoints = useMemo(
    () =>
      buildMonthlyCostSeries(
        data?.overview.branch_data?.diesel ?? [],
        data?.overview.branch_data?.utility ?? [],
      ),
    [data?.overview.branch_data?.diesel, data?.overview.branch_data?.utility],
  );
  const baselinePoints = useMemo(() => flattenBaseline(data?.baseline), [data?.baseline]);

  if (loading && !data) {
    return (
      <AccountScreen title="Cost Tracker">
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={WyreColors.purple} />
          <Text style={styles.loadingText}>Loading cost tracker…</Text>
        </View>
      </AccountScreen>
    );
  }

  if (error && !data) {
    return (
      <AccountScreen title="Cost Tracker">
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Unable to load cost tracker</Text>
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
      title="Cost Tracker"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void refresh()}
          tintColor={WyreColors.purple}
          colors={[WyreColors.purple]}
        />
      }>
      <Text style={styles.subtitle}>
        Diesel and utility spend for {branchName} — matching the web Cost Tracker.
      </Text>

      <CostTrackerActions />

      <View style={styles.sections}>
        <SectionCard title="Cost overview" subtitle="Monthly diesel and utility performance">
          <Text style={styles.sectionLabel}>Diesel overview</Text>
          <View style={styles.monthHint}>
            <Text style={styles.monthHintText}>Tap a month to view daily diesel entries</Text>
          </View>
          <CostTrackerTable
            columns={dieselOverviewColumns}
            rows={data?.dieselOverview ?? []}
            rowKey={(row) => row.month}
            footer={`${data?.dieselOverview.length ?? 0} months`}
            pressableColumnKey="month"
            onRowPress={(row) => setSelectedMonth(row.month)}
          />

          <Text style={[styles.sectionLabel, styles.sectionGap]}>Utility overview</Text>
          <CostTrackerTable
            columns={utilityOverviewColumns}
            rows={data?.utilityOverview ?? []}
            rowKey={(row) => row.month}
            footer={`${data?.utilityOverview.length ?? 0} months`}
          />
        </SectionCard>

        <SectionCard title={`Diesel purchased — ${branchName}`}>
          <CostTrackerTable
            columns={dieselPurchasedColumns}
            rows={dieselPurchases}
            rowKey={(row) => String(row.id)}
            footer={`${dieselPurchases.length} entries`}
          />
        </SectionCard>

        <SectionCard title={`Utility payments — ${branchName}`}>
          <CostTrackerTable
            columns={utilityPurchasedColumns}
            rows={utilityPurchases}
            rowKey={(row) => String(row.id)}
            footer={`${utilityPurchases.length} entries`}
          />
        </SectionCard>

        <SectionCard title={`Energy consumption — ${branchName}`} subtitle="Baseline vs actual">
          <CostTrackerBaselineChart points={baselinePoints} />
        </SectionCard>

        <SectionCard title={`Monthly cost — ${branchName}`} subtitle="Diesel and utility spend">
          <CostTrackerMonthlyChart points={monthlyCostPoints} />
        </SectionCard>
      </View>

      {error ? <Text style={styles.inlineError}>{error}</Text> : null}

      <DieselDetailModal
        visible={selectedMonth != null}
        month={selectedMonth}
        userId={userId}
        isOperator={isOperator}
        onClose={() => setSelectedMonth(null)}
      />
    </AccountScreen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: WyreColors.textSecondary,
    marginTop: -8,
  },
  sections: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: WyreColors.textPrimary,
  },
  sectionGap: {
    marginTop: 8,
  },
  monthHint: {
    backgroundColor: WyreColors.pageBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  monthHintText: {
    fontSize: 12,
    color: WyreColors.textSecondary,
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
