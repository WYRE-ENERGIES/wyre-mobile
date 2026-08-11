import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { WyreColors } from '@/constants/theme';
import { validateEmail } from '@/lib/auth-validation';
import { isReportReadyToSend } from '@/lib/report/helpers';
import type { ReportContext } from '@/lib/report/types';

type SendReportCardProps = {
  reportContext: ReportContext | null;
  recipient: string;
  onChangeRecipient: (value: string) => void;
  onSend: () => void;
  loading?: boolean;
  message?: string;
  error?: string;
};

export function SendReportCard({
  reportContext,
  recipient,
  onChangeRecipient,
  onSend,
  loading = false,
  message,
  error,
}: SendReportCardProps) {
  const ready = isReportReadyToSend(reportContext);
  const emailError = recipient ? validateEmail(recipient) : undefined;
  const canSend = ready && !emailError && Boolean(recipient.trim()) && !loading;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Send report</Text>
      <Text style={styles.body}>Email this report to a teammate or stakeholder.</Text>

      {message ? (
        <View style={styles.successBanner}>
          <Text style={styles.successBannerText}>{message}</Text>
        </View>
      ) : null}
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      ) : null}

      <TextInput
        value={recipient}
        onChangeText={onChangeRecipient}
        placeholder="Recipient email"
        placeholderTextColor="#9CA3AF"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        style={[styles.input, !!emailError && styles.inputError]}
      />
      {emailError ? <Text style={styles.error}>{emailError}</Text> : null}

      <AuthButton
        title={loading ? 'Sending…' : 'Send report'}
        onPress={onSend}
        disabled={!canSend}
        loading={loading}
      />

      {!ready ? (
        <Text style={styles.hint}>Select required parameters to enable sending.</Text>
      ) : null}
    </View>
  );
}

type ReportTypeTabsProps = {
  value: 'daily' | 'periodic' | 'monthly';
  onChange: (value: 'daily' | 'periodic' | 'monthly') => void;
};

export function ReportTypeTabs({ value, onChange }: ReportTypeTabsProps) {
  const tabs: Array<'daily' | 'periodic' | 'monthly'> = ['daily', 'periodic', 'monthly'];

  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => {
        const selected = value === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            style={[styles.tab, selected && styles.tabSelected]}>
            <Text style={[styles.tabLabel, selected && styles.tabLabelSelected]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: WyreColors.border,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: WyreColors.textPrimary,
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    color: WyreColors.textSecondary,
    marginBottom: 4,
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(92, 18, 167, 0.14)',
    backgroundColor: '#F5F0FA',
    paddingHorizontal: 14,
    fontSize: 16,
    color: WyreColors.textPrimary,
  },
  inputError: {
    borderColor: WyreColors.error,
  },
  hint: {
    fontSize: 12,
    color: WyreColors.textSecondary,
  },
  error: {
    fontSize: 13,
    color: WyreColors.error,
  },
  successBanner: {
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.28)',
  },
  successBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#15803D',
  },
  errorBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  errorBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: WyreColors.error,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: WyreColors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 9,
  },
  tabSelected: {
    backgroundColor: WyreColors.purple,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: WyreColors.textSecondary,
  },
  tabLabelSelected: {
    color: '#FFFFFF',
  },
});
