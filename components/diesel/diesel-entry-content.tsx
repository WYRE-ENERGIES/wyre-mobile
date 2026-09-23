import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/auth-button';
import { DieselEntryEditSheet } from '@/components/diesel/diesel-entry-edit-sheet';
import { ReportDateField } from '@/components/reports/report-date-fields';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { DashboardScreen } from '@/components/wyre/dashboard-screen';
import { useAppTheme } from '@/context/theme-context';
import { useDieselEntries } from '@/hooks/use-diesel-entries';
import { getBranchId } from '@/lib/auth-user';
import type {
  DieselDailyUsageEntry,
  DieselEntryKind,
  DieselMonthlyUsageEntry,
} from '@/lib/diesel-entry-types';
import { formatLitres, formatShortDate } from '@/lib/format';
import { toISODate } from '@/lib/report/helpers';
import { getUserRoleLabel } from '@/lib/user-display';
import { useAppSelector } from '@/redux/hooks';

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type EditTarget =
  | { kind: 'daily'; entry: DieselDailyUsageEntry }
  | { kind: 'monthly'; entry: DieselMonthlyUsageEntry };

function confirmSubmit(onConfirm: () => void) {
  Alert.alert(
    'Confirm submission',
    'After submitting, you will not be able to edit this entry after 30 minutes. Do you wish to continue?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Yes, submit', onPress: onConfirm },
    ],
  );
}

function formatDailyLabel(entry: DieselDailyUsageEntry): string {
  if (entry.startDate === entry.endDate) return formatShortDate(entry.startDate);
  return `${formatShortDate(entry.startDate)} → ${formatShortDate(entry.endDate)}`;
}

function formatMonthlyLabel(entry: DieselMonthlyUsageEntry): string {
  return `${MONTH_NAMES[entry.month - 1] ?? entry.month} ${entry.year}`;
}

export function DieselEntryContent() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ missed_date?: string }>();
  const userData = useAppSelector((state) => state.auth.userData);
  const branchId = getBranchId(userData);
  const role = getUserRoleLabel(userData)?.toUpperCase() ?? '';
  const isOperator = role === 'OPERATOR';

  const {
    generators,
    dailyEntries,
    monthlyEntries,
    loading,
    refreshing,
    submitting,
    error,
    refresh,
    submitDaily,
    submitMonthly,
    editDaily,
    editMonthly,
    isEditable,
  } = useDieselEntries(branchId);

  const todayIso = useMemo(() => toISODate(new Date()), []);
  const missedDate =
    typeof params.missed_date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(params.missed_date)
      ? params.missed_date
      : null;

  const [kind, setKind] = useState<DieselEntryKind>('daily');
  const [startDate, setStartDate] = useState(missedDate ?? todayIso);
  const [endDate, setEndDate] = useState(missedDate ?? todayIso);
  const [quantity, setQuantity] = useState('');
  const [generatorId, setGeneratorId] = useState<number | null>(null);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);

  useEffect(() => {
    if (missedDate) {
      setKind('daily');
      setStartDate(missedDate);
      setEndDate(missedDate);
    }
  }, [missedDate]);

  const recentDaily = dailyEntries.slice(0, 10);
  const recentMonthly = monthlyEntries.slice(0, 10);
  const today = useMemo(() => new Date(), []);

  const resetForm = () => {
    setQuantity('');
    setGeneratorId(null);
    setStartDate(todayIso);
    setEndDate(todayIso);
  };

  const onSubmit = () => {
    const amount = Number(quantity);
    if (!Number.isFinite(amount) || amount < 0) {
      Alert.alert('Enter a valid quantity in litres.');
      return;
    }
    if (!startDate) {
      Alert.alert('Select a start date.');
      return;
    }
    const resolvedEnd = endDate || startDate;
    if (resolvedEnd < startDate) {
      Alert.alert('End date cannot be before the start date.');
      return;
    }

    confirmSubmit(() => {
      void (async () => {
        const ok =
          kind === 'daily'
            ? await submitDaily({
                quantity: amount,
                startDate,
                endDate: resolvedEnd,
                generatorIds: generatorId != null ? [generatorId] : undefined,
              })
            : await submitMonthly({
                quantity: amount,
                startDate,
                endDate: resolvedEnd,
              });
        if (ok) {
          Alert.alert('Saved', `New ${kind} diesel entry added.`);
          resetForm();
        }
      })();
    });
  };

  if (!isOperator) {
    return (
      <DashboardScreen>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={8}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
            <IconSymbol name="chevron.left" size={22} color={colors.textOnPage} />
          </Pressable>
          <Text style={[styles.topTitle, { color: colors.textOnPage }]}>Diesel entries</Text>
          <View style={styles.iconBtn} />
        </View>
        <View style={styles.centered}>
          <Text style={[styles.errorTitle, { color: colors.textOnPage }]}>Operators only</Text>
          <Text style={[styles.muted, { color: colors.textOnPageMuted }]}>
            Diesel entry recording is limited to operator accounts for this branch.
          </Text>
        </View>
      </DashboardScreen>
    );
  }

  return (
    <DashboardScreen>
      <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
        <Pressable
          onPress={() => router.back()}
          accessibilityLabel="Back"
          hitSlop={8}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.pressed]}>
          <IconSymbol name="chevron.left" size={22} color={colors.textOnPage} />
        </Pressable>
        <Text style={[styles.topTitle, { color: colors.textOnPage }]}>Diesel entries</Text>
        <View style={styles.iconBtn} />
      </View>

      {loading && dailyEntries.length === 0 && monthlyEntries.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.muted, { color: colors.textOnPageMuted }]}>
            Loading diesel entries…
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void refresh()}
              tintColor={colors.accent}
            />
          }>
          {missedDate ? (
            <View style={[styles.banner, { backgroundColor: colors.accentMuted }]}>
              <IconSymbol name="fuelpump.fill" size={18} color={colors.accent} />
              <Text style={[styles.bannerText, { color: colors.textOnPage }]}>
                Missing entry for {formatShortDate(missedDate)}. Record it below.
              </Text>
            </View>
          ) : null}

          <View style={[styles.segment, { backgroundColor: colors.surface }]}>
            {(['daily', 'monthly'] as DieselEntryKind[]).map((option) => {
              const selected = kind === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setKind(option)}
                  style={[
                    styles.segmentItem,
                    selected && { backgroundColor: colors.accent },
                  ]}>
                  <Text
                    style={[
                      styles.segmentText,
                      { color: selected ? '#FFFFFF' : colors.textOnCardSecondary },
                    ]}>
                    {option === 'daily' ? 'Daily' : 'Monthly'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.textOnCard }]}>
              Add {kind} diesel entry
            </Text>
            <Text style={[styles.cardSubtitle, { color: colors.textOnCardSecondary }]}>
              Entries can be edited for 30 minutes after submission.
            </Text>

            <ReportDateField
              label="From date"
              value={startDate}
              maximumDate={today}
              onChange={(next) => {
                setStartDate(next);
                if (!endDate || endDate < next) setEndDate(next);
              }}
            />
            <ReportDateField
              label="To date (optional)"
              value={endDate}
              maximumDate={today}
              onChange={setEndDate}
            />

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.textOnCardSecondary }]}>
                Quantity (litres)
              </Text>
              <TextInput
                value={quantity}
                onChangeText={(text) => setQuantity(text.replace(/[^0-9.]/g, ''))}
                keyboardType="decimal-pad"
                placeholder="Enter quantity"
                placeholderTextColor={colors.textOnCardSecondary}
                style={[
                  styles.input,
                  {
                    color: colors.textOnCard,
                    backgroundColor: colors.surfaceMuted,
                    borderColor: colors.border,
                  },
                ]}
              />
            </View>

            {kind === 'daily' ? (
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textOnCardSecondary }]}>
                  Generator {generators.length === 0 ? '(optional)' : ''}
                </Text>
                {generators.length === 0 ? (
                  <Text style={[styles.hint, { color: colors.textOnCardSecondary }]}>
                    No generators listed for this branch.
                  </Text>
                ) : (
                  <View style={styles.chips}>
                    {generators.map((generator) => {
                      const selected = generator.deviceId === generatorId;
                      return (
                        <Pressable
                          key={generator.deviceId}
                          onPress={() =>
                            setGeneratorId(selected ? null : generator.deviceId)
                          }
                          style={[
                            styles.chip,
                            {
                              backgroundColor: selected
                                ? colors.accent
                                : colors.surfaceMuted,
                            },
                          ]}>
                          <Text
                            style={[
                              styles.chipText,
                              { color: selected ? '#FFFFFF' : colors.textOnCard },
                            ]}>
                            {generator.name}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                )}
              </View>
            ) : null}

            {error ? (
              <Text style={[styles.formError, { color: colors.error }]}>{error}</Text>
            ) : null}

            <AuthButton
              title={`Submit ${kind} entry`}
              onPress={onSubmit}
              loading={submitting}
            />
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text style={[styles.cardTitle, { color: colors.textOnCard }]}>
              Recent {kind} entries
            </Text>

            {kind === 'daily' ? (
              recentDaily.length === 0 ? (
                <Text style={[styles.hint, { color: colors.textOnCardSecondary }]}>
                  No daily diesel entries yet.
                </Text>
              ) : (
                recentDaily.map((entry) => {
                  const editable = entry.id != null && isEditable(entry.recordTime);
                  return (
                    <View
                      key={`${entry.id ?? entry.startDate}-${entry.quantity}-${entry.recordTime}`}
                      style={[styles.entryRow, { borderTopColor: colors.border }]}>
                      <View style={styles.entryCopy}>
                        <Text style={[styles.entryTitle, { color: colors.textOnCard }]}>
                          {formatDailyLabel(entry)}
                        </Text>
                        <Text style={[styles.entryMeta, { color: colors.textOnCardSecondary }]}>
                          {formatLitres(entry.quantity)}
                          {entry.generatorName ? ` · ${entry.generatorName}` : ''}
                        </Text>
                      </View>
                      <Pressable
                        disabled={!editable}
                        onPress={() => setEditTarget({ kind: 'daily', entry })}
                        style={[
                          styles.editBtn,
                          {
                            backgroundColor: editable
                              ? colors.accent
                              : colors.surfaceMuted,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.editBtnText,
                            { color: editable ? '#FFFFFF' : colors.textOnCardSecondary },
                          ]}>
                          {editable ? 'Edit' : 'Locked'}
                        </Text>
                      </Pressable>
                    </View>
                  );
                })
              )
            ) : recentMonthly.length === 0 ? (
              <Text style={[styles.hint, { color: colors.textOnCardSecondary }]}>
                No monthly diesel entries yet.
              </Text>
            ) : (
              recentMonthly.map((entry) => {
                const editable = entry.id != null && isEditable(entry.recordTime);
                return (
                  <View
                    key={`${entry.id ?? entry.month}-${entry.year}-${entry.quantity}`}
                    style={[styles.entryRow, { borderTopColor: colors.border }]}>
                    <View style={styles.entryCopy}>
                      <Text style={[styles.entryTitle, { color: colors.textOnCard }]}>
                        {formatMonthlyLabel(entry)}
                      </Text>
                      <Text style={[styles.entryMeta, { color: colors.textOnCardSecondary }]}>
                        {formatLitres(entry.quantity)}
                      </Text>
                    </View>
                    <Pressable
                      disabled={!editable}
                      onPress={() => setEditTarget({ kind: 'monthly', entry })}
                      style={[
                        styles.editBtn,
                        {
                          backgroundColor: editable ? colors.accent : colors.surfaceMuted,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.editBtnText,
                          { color: editable ? '#FFFFFF' : colors.textOnCardSecondary },
                        ]}>
                        {editable ? 'Edit' : 'Locked'}
                      </Text>
                    </Pressable>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      )}

      <DieselEntryEditSheet
        visible={editTarget != null}
        target={editTarget}
        generators={generators}
        saving={submitting}
        onClose={() => setEditTarget(null)}
        onSaveDaily={editDaily}
        onSaveMonthly={editMonthly}
      />
    </DashboardScreen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    gap: 10,
  },
  muted: {
    fontSize: 14,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  segment: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    borderRadius: 11,
    alignItems: 'center',
    paddingVertical: 10,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '700',
  },
  card: {
    borderRadius: 20,
    padding: 18,
    gap: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: -6,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    minHeight: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  formError: {
    fontSize: 13,
    lineHeight: 18,
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  entryCopy: {
    flex: 1,
    gap: 3,
  },
  entryTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  entryMeta: {
    fontSize: 13,
  },
  editBtn: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.72,
  },
});
