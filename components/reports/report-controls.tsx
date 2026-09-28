import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { WyreColors } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';
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
  const { colors } = useAppTheme();
  const ready = isReportReadyToSend(reportContext);
  const emailError = recipient ? validateEmail(recipient) : undefined;
  const canSend = ready && !emailError && Boolean(recipient.trim()) && !loading;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.textOnCard }]}>Get the full report</Text>
      <Text style={[styles.body, { color: colors.textOnCardSecondary }]}>
        Receive the detailed charts, tables, and source breakdown by email.
      </Text>

      {message ? (
        <View style={styles.statusBanner}>
          <IconSymbol name="checkmark.circle.fill" size={20} color={colors.success} />
          <Text style={[styles.statusText, { color: colors.textOnCard }]}>{message}</Text>
        </View>
      ) : null}
      {error ? (
        <View style={styles.statusBanner}>
          <IconSymbol name="exclamationmark.circle.fill" size={20} color={colors.error} />
          <Text style={[styles.statusText, { color: colors.textOnCard }]}>{error}</Text>
        </View>
      ) : null}

      <Text style={[styles.inputLabel, { color: colors.textOnCardSecondary }]}>
        Email address
      </Text>
      <TextInput
        value={recipient}
        onChangeText={onChangeRecipient}
        placeholder="Recipient email"
        placeholderTextColor="#9CA3AF"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        style={[
          styles.input,
          {
            color: colors.textOnCard,
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.border,
          },
          !!emailError && styles.inputError,
        ]}
      />
      {emailError ? <Text style={styles.error}>{emailError}</Text> : null}

      <AuthButton
        title={loading ? 'Sending…' : 'Email full report'}
        onPress={onSend}
        disabled={!canSend}
        loading={loading}
        accent={colors.accent}
        style={styles.sendButton}
      />

      {!ready ? (
        <Text style={[styles.hint, { color: colors.textOnCardSecondary }]}>
          Select required parameters to enable sending.
        </Text>
      ) : null}
    </View>
  );
}

type ReportTypeTabsProps = {
  value: 'daily' | 'periodic' | 'monthly';
  onChange: (value: 'daily' | 'periodic' | 'monthly') => void;
};

export function ReportTypeTabs({ value, onChange }: ReportTypeTabsProps) {
  const tabs: ('daily' | 'periodic' | 'monthly')[] = ['daily', 'periodic', 'monthly'];
  const { colors, isDark } = useAppTheme();

  return (
    <View style={[styles.tabs, { backgroundColor: colors.surface }]}>
      {tabs.map((tab) => {
        const selected = value === tab;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            style={[
              styles.tab,
              selected && {
                backgroundColor: isDark ? colors.surfaceMuted : colors.accent,
              },
            ]}>
            <Text
              style={[
                styles.tabLabel,
                { color: colors.textOnCardSecondary },
                selected && { color: isDark ? colors.accent : colors.textOnAccent },
              ]}>
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
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
  },
  body: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 16,
  },
  inputLabel: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '700',
  },
  sendButton: {
    minHeight: 52,
    borderRadius: 14,
    marginTop: 2,
  },
  inputError: {
    borderColor: WyreColors.error,
  },
  hint: {
    fontSize: 12,
  },
  error: {
    fontSize: 13,
    color: WyreColors.error,
  },
  statusBanner: {
    minHeight: 42,
    borderRadius: 12,
    paddingHorizontal: 11,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  statusText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  tabs: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 9,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});
