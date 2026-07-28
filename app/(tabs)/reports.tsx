import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MonthlyReportView } from '@/components/reports/monthly-report-view';
import {
  ReportTypeTabs,
  SendReportCard,
} from '@/components/reports/report-controls';
import {
  ReportDateField,
  ReportMonthYearFields,
} from '@/components/reports/report-date-fields';
import { ReportHtmlPreview } from '@/components/reports/report-html-preview';
import { AppHeader } from '@/components/wyre/app-header';
import { UserAvatarButton } from '@/components/wyre/user-avatar-button';
import { WyreColors } from '@/constants/theme';
import {
  DUMMY_MONTHLY_REPORT,
  buildReportContext,
  getPreviousMonth,
  monthLabel,
} from '@/lib/report/helpers';
import {
  fetchMonthlyReportData,
  previewReportHtml,
  sendReportEmail,
} from '@/lib/report/report-api';
import type { MonthlyReportModel, ReportType } from '@/lib/report/types';
import { useAppSelector } from '@/redux/hooks';

const TAB_BAR_CLEARANCE = 96;

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const userData = useAppSelector((state) => state.auth.userData);
  const branchId =
    typeof userData?.branch_id === 'number' || typeof userData?.branch_id === 'string'
      ? userData.branch_id
      : null;

  const previous = getPreviousMonth();
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [date, setDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [month, setMonth] = useState(previous.month);
  const [year, setYear] = useState(previous.year);

  const [monthlyReport, setMonthlyReport] =
    useState<MonthlyReportModel>(DUMMY_MONTHLY_REPORT);
  const [monthlyLoading, setMonthlyLoading] = useState(false);
  const [monthlyNote, setMonthlyNote] = useState(
    'Sample Actual Report (matches dashboard UI).',
  );

  const [previewHtml, setPreviewHtml] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);

  const [recipient, setRecipient] = useState('');
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
    return Array.from({ length: 8 }, (_, i) => currentYear - i);
  }, []);

  const monthOptions = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    return Array.from({ length: 12 }, (_, i) => {
      const value = i + 1;
      return {
        value,
        label: monthLabel(value),
        disabled: year === currentYear && value > currentMonth,
      };
    });
  }, [year]);

  useEffect(() => {
    if (reportType !== 'monthly') return;

    let cancelled = false;

    const load = async () => {
      setMonthlyReport({
        ...DUMMY_MONTHLY_REPORT,
        monthLabel: monthLabel(month),
        year,
        currentEfficiency: {
          ...DUMMY_MONTHLY_REPORT.currentEfficiency,
          label: `${monthLabel(month)} Month Efficiency`,
        },
      });

      if (!branchId) {
        setMonthlyNote(
          'Sample Actual Report (matches dashboard UI). Branch context unlocks live data.',
        );
        return;
      }

      setMonthlyLoading(true);
      try {
        const data = await fetchMonthlyReportData(branchId, month, year);
        if (cancelled) return;
        setMonthlyReport({
          ...data,
          monthLabel: data.monthLabel || monthLabel(month),
          year: data.year || year,
        });
        setMonthlyNote('');
      } catch {
        if (cancelled) return;
        setMonthlyNote('Could not load live report. Showing sample Actual Report UI.');
      } finally {
        if (!cancelled) setMonthlyLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [reportType, branchId, month, year]);

  useEffect(() => {
    if (reportType === 'monthly') {
      setPreviewHtml('');
      return;
    }

    if (!reportContext) {
      setPreviewHtml('');
      return;
    }

    let cancelled = false;
    setPreviewLoading(true);

    previewReportHtml(reportContext)
      .then((html) => {
        if (!cancelled) setPreviewHtml(html);
      })
      .catch(() => {
        if (!cancelled) setPreviewHtml('');
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [reportType, reportContext]);

  const onSend = async () => {
    if (!reportContext) return;
    setSendLoading(true);
    setSendMessage('');
    setSendError('');
    try {
      await sendReportEmail(reportContext, recipient.trim());
      const success = 'Report sent successfully.';
      setSendMessage(success);
      setRecipient('');
      Alert.alert('Report sent', success);
    } catch {
      const failure = 'Failed to send report. Check the recipient and try again.';
      setSendError(failure);
      Alert.alert('Send failed', failure);
    } finally {
      setSendLoading(false);
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
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.pageHeader}>
          <Text style={styles.title}>Reports</Text>
          <Text style={styles.subtitle}>
            Generate daily, periodic, or monthly energy reports for your branch.
          </Text>
        </View>

        <View style={styles.controlsCard}>
          <ReportTypeTabs value={reportType} onChange={setReportType} />

          {reportType === 'daily' ? (
            <ReportDateField
              label="Select date"
              value={date}
              onChange={setDate}
              maximumDate={new Date()}
            />
          ) : null}

          {reportType === 'periodic' ? (
            <View style={styles.rangeCol}>
              <ReportDateField
                label="Start date"
                value={startDate}
                onChange={setStartDate}
                maximumDate={new Date()}
                style={styles.dateField}
              />
              <ReportDateField
                label="End date"
                value={endDate}
                onChange={setEndDate}
                maximumDate={new Date()}
                style={styles.dateField}
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

        <View style={styles.section}>
          {reportType === 'monthly' ? (
            <View style={styles.gap}>
              {monthlyNote ? <Text style={styles.sampleNote}>{monthlyNote}</Text> : null}
              {monthlyLoading ? (
                <View style={styles.loadingBox}>
                  <ActivityIndicator color={WyreColors.purple} />
                  <Text style={styles.hint}>Loading report data…</Text>
                </View>
              ) : (
                <MonthlyReportView report={monthlyReport} />
              )}
            </View>
          ) : (
            <ReportHtmlPreview
              html={previewHtml}
              loading={previewLoading}
              emptyMessage="Pick dates with the calendar to preview the emailed report."
            />
          )}
        </View>

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
    paddingTop: 16,
    gap: 16,
  },
  pageHeader: {
    gap: 4,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: WyreColors.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: WyreColors.textSecondary,
  },
  controlsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    gap: 14,
    borderWidth: 1,
    borderColor: WyreColors.border,
  },
  rangeCol: {
    gap: 12,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  dateField: {
    flex: 1,
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
    color: WyreColors.textSecondary,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: WyreColors.textPrimary,
    paddingHorizontal: 4,
  },
  gap: {
    gap: 8,
  },
  loadingBox: {
    minHeight: 180,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  sampleNote: {
    fontSize: 12,
    color: WyreColors.textSecondary,
    paddingHorizontal: 4,
  },
});
