import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReportTypeTabs, SendReportCard } from '@/components/reports/report-controls';
import { ReportDateField, ReportMonthYearFields } from '@/components/reports/report-date-fields';
import { ReportSummaryView } from '@/components/reports/report-summary-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DashboardScreen } from '@/components/wyre/dashboard-screen';
import { NotificationBellButton } from '@/components/wyre/notification-bell-button';
import { useAppTheme } from '@/context/theme-context';
import { getBranchId } from '@/lib/auth-user';
import {
  buildReportContext,
  getPreviousMonth,
  monthLabel,
} from '@/lib/report/helpers';
import { fetchMonthlyReportData, sendReportEmail } from '@/lib/report/report-api';
import type { MonthlyReportModel, ReportType } from '@/lib/report/types';
import { getBranchLabel } from '@/lib/user-display';
import { useAppSelector } from '@/redux/hooks';

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const userData = useAppSelector((state) => state.auth.userData);
  const branchId = getBranchId(userData);
  const branchName = getBranchLabel(userData);
  const previous = getPreviousMonth();
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [date, setDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [month, setMonth] = useState(previous.month);
  const [year, setYear] = useState(previous.year);
  const [monthlyReport, setMonthlyReport] = useState<MonthlyReportModel | null>(null);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [monthlyError, setMonthlyError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);
  const [recipient, setRecipient] = useState(
    typeof userData?.email === 'string' ? userData.email : '',
  );
  const [sendLoading, setSendLoading] = useState(false);
  const [sendMessage, setSendMessage] = useState('');
  const [sendError, setSendError] = useState('');

  const reportContext = useMemo(
    () =>
      buildReportContext({
        reportType,
        branchId,
        date,
        startDate,
        endDate,
        month,
        year,
      }),
    [reportType, branchId, date, startDate, endDate, month, year],
  );

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 8 }, (_, index) => currentYear - index);
  }, []);

  const monthOptions = useMemo(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, index) => {
      const value = index + 1;
      return {
        value,
        label: monthLabel(value),
        disabled: year === now.getFullYear() && value > now.getMonth() + 1,
      };
    });
  }, [year]);

  useEffect(() => {
    if (reportType !== 'monthly' || !branchId) {
      setMonthlyReport(null);
      return;
    }
    let cancelled = false;
    setMonthlyLoading(true);
    setMonthlyError('');
    fetchMonthlyReportData(branchId, month, year)
      .then((report) => {
        if (!cancelled) {
          setMonthlyReport({
            ...report,
            monthLabel: report.monthLabel || monthLabel(month),
            year: report.year || year,
          });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMonthlyReport(null);
          setMonthlyError('We could not prepare this summary. Try another month or reload.');
        }
      })
      .finally(() => {
        if (!cancelled) setMonthlyLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reportType, branchId, month, year, reloadKey]);

  const onSend = async () => {
    if (!reportContext) return;
    setSendLoading(true);
    setSendMessage('');
    setSendError('');
    try {
      await sendReportEmail(reportContext, recipient.trim());
      setSendMessage(`Sent to ${recipient.trim()}`);
    } catch {
      const message = 'Couldn’t send the report. Please try again.';
      setSendError(message);
    } finally {
      setSendLoading(false);
    }
  };

  return (
    <DashboardScreen>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.textOnPage }]}>Reports</Text>
          <Text style={[styles.subtitle, { color: colors.textOnPageMuted }]}>
            {branchName ?? 'Your branch'} · clear energy insights
          </Text>
        </View>
        <NotificationBellButton />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}>
        <View style={[styles.controls, { backgroundColor: colors.surface }]}>
          <ReportTypeTabs value={reportType} onChange={setReportType} />
          {reportType === 'daily' ? (
            <ReportDateField
              label="Report date"
              value={date}
              onChange={setDate}
              maximumDate={new Date()}
            />
          ) : null}
          {reportType === 'periodic' ? (
            <View style={styles.range}>
              <ReportDateField
                label="From"
                value={startDate}
                onChange={setStartDate}
                maximumDate={new Date()}
                style={styles.rangeField}
              />
              <ReportDateField
                label="To"
                value={endDate}
                onChange={setEndDate}
                maximumDate={new Date()}
                style={styles.rangeField}
              />
            </View>
          ) : null}
          {reportType === 'monthly' ? (
            <ReportMonthYearFields
              month={month}
              year={year}
              onChangeMonth={setMonth}
              onChangeYear={setYear}
              monthOptions={monthOptions}
              yearOptions={yearOptions}
            />
          ) : null}
        </View>

        {reportType === 'monthly' ? (
          monthlyLoading ? (
            <View style={[styles.state, { backgroundColor: colors.surface }]}>
              <ActivityIndicator color={colors.accent} />
              <Text style={[styles.stateBody, { color: colors.textOnCardSecondary }]}>
                Reading your report…
              </Text>
            </View>
          ) : monthlyReport ? (
            <ReportSummaryView report={monthlyReport} />
          ) : (
            <View style={[styles.state, { backgroundColor: colors.surface }]}>
              <IconSymbol name="chart.bar" size={28} color={colors.textOnCardSecondary} />
              <Text style={[styles.stateTitle, { color: colors.textOnCard }]}>
                Summary unavailable
              </Text>
              <Text style={[styles.stateBody, { color: colors.textOnCardSecondary }]}>
                {monthlyError || 'Select a branch and month to view its summary.'}
              </Text>
              <Pressable
                onPress={() => setReloadKey((value) => value + 1)}
                style={[styles.retry, { backgroundColor: colors.surfaceMuted }]}>
                <Text style={[styles.retryText, { color: colors.textOnCard }]}>Try again</Text>
              </Pressable>
            </View>
          )
        ) : (
          <View style={[styles.deliveryNote, { backgroundColor: colors.accentMuted }]}>
            <IconSymbol name="info.circle" size={19} color={colors.accent} />
            <View style={styles.deliveryCopy}>
              <Text style={[styles.deliveryTitle, { color: colors.textOnPage }]}>
                Full report by email
              </Text>
              <Text style={[styles.deliveryBody, { color: colors.textOnPageMuted }]}>
                Select the date range, then send the detailed report below.
              </Text>
            </View>
          </View>
        )}

        <SendReportCard
          reportContext={reportContext}
          recipient={recipient}
          onChangeRecipient={(value) => {
            setRecipient(value);
            setSendMessage('');
            setSendError('');
          }}
          onSend={onSend}
          loading={sendLoading}
          message={sendMessage}
          error={sendError}
        />
      </ScrollView>
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
  title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.6 },
  subtitle: { fontSize: 13 },
  content: { paddingHorizontal: 16, gap: 14 },
  controls: { borderRadius: 20, padding: 12, gap: 13 },
  range: { flexDirection: 'row', gap: 10 },
  rangeField: { flex: 1 },
  state: {
    minHeight: 190,
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  stateTitle: { fontSize: 17, fontWeight: '800' },
  stateBody: { fontSize: 13, lineHeight: 19, textAlign: 'center' },
  retry: { minHeight: 40, marginTop: 5, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' },
  retryText: { fontSize: 12, fontWeight: '800' },
  deliveryNote: { borderRadius: 18, padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  deliveryCopy: { flex: 1 },
  deliveryTitle: { fontSize: 14, fontWeight: '800' },
  deliveryBody: { marginTop: 3, fontSize: 12, lineHeight: 17 },
});
