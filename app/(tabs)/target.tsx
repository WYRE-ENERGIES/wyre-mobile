import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { DashboardScreen } from '@/components/wyre/dashboard-screen';
import { NotificationBellButton } from '@/components/wyre/notification-bell-button';
import { useSiteCapabilities } from '@/context/site-capability-context';
import { useAppTheme } from '@/context/theme-context';
import { useNotificationSettings } from '@/hooks/use-notification-settings';
import { getBranchId } from '@/lib/auth-user';
import type { BatteryThresholdOperator } from '@/lib/notification-settings-api';
import { getBranchLabel } from '@/lib/user-display';
import { useAppSelector } from '@/redux/hooks';

const DAYS = [
  { id: '0', short: 'M', label: 'Mon' },
  { id: '1', short: 'T', label: 'Tue' },
  { id: '2', short: 'W', label: 'Wed' },
  { id: '3', short: 'T', label: 'Thu' },
  { id: '4', short: 'F', label: 'Fri' },
  { id: '5', short: 'S', label: 'Sat' },
  { id: '6', short: 'S', label: 'Sun' },
];
const EVERY_DAY = DAYS.map((day) => day.id);

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function displayTime(value: string): string {
  const [hoursString, minutes = '00'] = value.split(':');
  const hours = Number(hoursString);
  if (!Number.isFinite(hours)) return value;
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes} ${suffix}`;
}

function daysLabel(csv: string): string {
  const ids = csv.split(',').filter(Boolean);
  if (ids.length === 7) return 'Every day';
  if (ids.join(',') === '0,1,2,3,4') return 'Weekdays';
  return DAYS.filter((day) => ids.includes(day.id))
    .map((day) => day.label)
    .join(', ');
}

function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  const { colors } = useAppTheme();
  return <View style={[styles.card, { backgroundColor: colors.surface }, style]}>{children}</View>;
}

function SectionHeading({
  icon,
  title,
  subtitle,
  color,
}: {
  icon: 'battery.100.bolt' | 'gauge.with.dots.needle.33percent';
  title: string;
  subtitle: string;
  color: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.sectionHeading}>
      <View style={[styles.headingIcon, { backgroundColor: `${color}1F` }]}>
        <IconSymbol name={icon} size={21} color={color} />
      </View>
      <View style={styles.headingCopy}>
        <Text style={[styles.sectionTitle, { color: colors.textOnCard }]}>{title}</Text>
        <Text style={[styles.sectionSubtitle, { color: colors.textOnCardSecondary }]}>
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

function ToggleRow({
  title,
  subtitle,
  value,
  disabled,
  onChange,
  last = false,
}: {
  title: string;
  subtitle: string;
  value: boolean;
  disabled: boolean;
  onChange: (value: boolean) => void;
  last?: boolean;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.toggleRow, !last && { borderBottomColor: colors.border }]}>
      <View style={styles.toggleCopy}>
        <Text style={[styles.toggleTitle, { color: colors.textOnCard }]}>{title}</Text>
        <Text style={[styles.toggleSubtitle, { color: colors.textOnCardSecondary }]}>
          {subtitle}
        </Text>
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onChange}
        trackColor={{ false: colors.surfaceMuted, true: colors.accent }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}

function EmptyRow({ text }: { text: string }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.emptyRow, { backgroundColor: colors.surfaceMuted }]}>
      <Text style={[styles.emptyRowText, { color: colors.textOnCardSecondary }]}>{text}</Text>
    </View>
  );
}

function AddButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled: boolean }) {
  const { colors } = useAppTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.addButton,
        { backgroundColor: colors.surfaceMuted },
        (pressed || disabled) && styles.faded,
      ]}>
      <IconSymbol name="plus" size={17} color={colors.accent} />
      <Text style={[styles.addButtonText, { color: colors.accent }]}>{label}</Text>
    </Pressable>
  );
}

function TimeModal({
  visible,
  saving,
  onClose,
  onSave,
}: {
  visible: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (time: string, days: string) => void;
}) {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useAppTheme();
  const [time, setTime] = useState(() => {
    const next = new Date();
    next.setMinutes(Math.ceil(next.getMinutes() / 15) * 15, 0, 0);
    return next;
  });
  const [selectedDays, setSelectedDays] = useState<string[]>(EVERY_DAY);

  const toggleDay = (id: string) => {
    setSelectedDays((current) =>
      current.includes(id) ? current.filter((day) => day !== id) : [...current, id],
    );
  };

  const save = () => {
    if (selectedDays.length === 0) {
      Alert.alert('Choose at least one day');
      return;
    }
    onSave(
      formatTime(time),
      [...selectedDays].sort((a, b) => Number(a) - Number(b)).join(','),
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View
          style={[
            styles.modalSheet,
            { backgroundColor: colors.surface, paddingBottom: insets.bottom + 18 },
          ]}>
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.textOnCard }]}>Add send time</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textOnCardSecondary }]}>
                Africa/Lagos time
              </Text>
            </View>
            <Pressable onPress={onClose} style={[styles.modalClose, { backgroundColor: colors.surfaceMuted }]}>
              <IconSymbol name="xmark" size={20} color={colors.textOnCard} />
            </Pressable>
          </View>
          <DateTimePicker
            value={time}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            is24Hour
            minuteInterval={15}
            themeVariant={isDark ? 'dark' : 'light'}
            onChange={(_, next) => {
              if (next) setTime(next);
            }}
          />
          <Text style={[styles.inputLabel, { color: colors.textOnCard }]}>Repeat on</Text>
          <View style={styles.days}>
            {DAYS.map((day) => {
              const selected = selectedDays.includes(day.id);
              return (
                <Pressable
                  key={day.id}
                  onPress={() => toggleDay(day.id)}
                  accessibilityLabel={day.label}
                  style={[
                    styles.day,
                    {
                      backgroundColor: selected ? colors.accent : colors.surfaceMuted,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.dayText,
                      { color: selected ? colors.textOnAccent : colors.textOnCardSecondary },
                    ]}>
                    {day.short}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Pressable
            onPress={save}
            disabled={saving}
            style={[styles.primaryButton, { backgroundColor: colors.accent }, saving && styles.faded]}>
            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Add time</Text>}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function ThresholdModal({
  visible,
  saving,
  onClose,
  onSave,
}: {
  visible: boolean;
  saving: boolean;
  onClose: () => void;
  onSave: (operator: BatteryThresholdOperator, value: number) => void;
}) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [operator, setOperator] = useState<BatteryThresholdOperator>('lte');
  const [value, setValue] = useState('30');

  const save = () => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0 || numeric > 100) {
      Alert.alert('Enter a value from 0 to 100');
      return;
    }
    onSave(operator, numeric);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        <View
          style={[
            styles.modalSheet,
            { backgroundColor: colors.surface, paddingBottom: insets.bottom + 18 },
          ]}>
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
          <View style={styles.modalHeader}>
            <View>
              <Text style={[styles.modalTitle, { color: colors.textOnCard }]}>Add SOC rule</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textOnCardSecondary }]}>
                Notify when the battery crosses this level
              </Text>
            </View>
            <Pressable onPress={onClose} style={[styles.modalClose, { backgroundColor: colors.surfaceMuted }]}>
              <IconSymbol name="xmark" size={20} color={colors.textOnCard} />
            </Pressable>
          </View>
          <View style={[styles.operatorTabs, { backgroundColor: colors.surfaceMuted }]}>
            {(['lte', 'gte'] as BatteryThresholdOperator[]).map((item) => {
              const selected = item === operator;
              return (
                <Pressable
                  key={item}
                  onPress={() => setOperator(item)}
                  style={[styles.operatorTab, selected && { backgroundColor: colors.surface }]}>
                  <Text
                    style={[
                      styles.operatorText,
                      { color: selected ? colors.textOnCard : colors.textOnCardSecondary },
                    ]}>
                    {item === 'lte' ? 'Drops to / below' : 'Rises to / above'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={[styles.inputLabel, { color: colors.textOnCard }]}>Battery level</Text>
          <View style={[styles.percentInput, { backgroundColor: colors.surfaceMuted }]}>
            <TextInput
              value={value}
              onChangeText={(text) => setValue(text.replace(/[^0-9.]/g, ''))}
              keyboardType="decimal-pad"
              maxLength={5}
              selectTextOnFocus
              style={[styles.percentInputText, { color: colors.textOnCard }]}
            />
            <Text style={[styles.percentSymbol, { color: colors.textOnCardSecondary }]}>%</Text>
          </View>
          <Pressable
            onPress={save}
            disabled={saving}
            style={[styles.primaryButton, { backgroundColor: colors.accent }, saving && styles.faded]}>
            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryText}>Add rule</Text>}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function TargetScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const userData = useAppSelector((state) => state.auth.userData);
  const { hasSolar: solarCustomer } = useSiteCapabilities();
  const branchId = getBranchId(userData);
  const branchName = getBranchLabel(userData);
  const settings = useNotificationSettings(solarCustomer ? branchId : null);
  const displayBranchName =
    settings.batteryConfig?.branch_name ??
    settings.capacityConfig?.branch_name ??
    branchName;
  const [timeOpen, setTimeOpen] = useState(false);
  const [thresholdOpen, setThresholdOpen] = useState(false);
  const [capacityDraft, setCapacityDraft] = useState(80);
  const disabled = settings.busy != null;

  useEffect(() => {
    if (settings.capacityConfig) {
      setCapacityDraft(Math.round(settings.capacityConfig.threshold_pct));
    }
  }, [settings.capacityConfig]);

  const permissionDenied =
    !settings.batteryConfig &&
    !settings.capacityConfig &&
    settings.batteryAvailability === 'forbidden' &&
    settings.capacityAvailability === 'forbidden';
  const bothUnavailable =
    settings.batteryAvailability === 'unavailable' &&
    settings.capacityAvailability === 'unavailable';
  const settingsApiUnavailable =
    settings.batteryAvailability === 'error' &&
    settings.capacityAvailability === 'error' &&
    !settings.batteryConfig &&
    !settings.capacityConfig;
  const noAvailableSettings =
    !settings.batteryConfig &&
    !settings.capacityConfig &&
    !settings.loading &&
    !settingsApiUnavailable &&
    !permissionDenied &&
    !bothUnavailable;
  const capacityChanged =
    settings.capacityConfig != null &&
    capacityDraft !== Math.round(settings.capacityConfig.threshold_pct);

  const deleteTime = (id: number, time: string) => {
    Alert.alert('Remove send time?', `${displayTime(time)} will no longer send a digest.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => void settings.removeTime(id) },
    ]);
  };

  const deleteThreshold = (id: number, label: string) => {
    Alert.alert('Remove SOC rule?', label, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => void settings.removeThreshold(id) },
    ]);
  };

  const stateMessage = useMemo(() => {
    if (!solarCustomer) return 'Alert targets are available for solar branches only.';
    if (!branchId) return 'Your account is not linked to a branch.';
    if (permissionDenied) return 'You are not permitted to change alert settings for this branch.';
    if (bothUnavailable) return 'This branch has no compatible battery or inverter capacity.';
    if (noAvailableSettings) {
      return 'Alert settings are not available for this account or branch.';
    }
    if (settingsApiUnavailable) {
      return settings.error ?? 'The notification settings service is currently unavailable.';
    }
    return null;
  }, [
    solarCustomer,
    branchId,
    permissionDenied,
    bothUnavailable,
    noAvailableSettings,
    settingsApiUnavailable,
    settings.error,
  ]);

  return (
    <DashboardScreen>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: colors.textOnPage }]}>Alert settings</Text>
          <Text style={[styles.subtitle, { color: colors.textOnPageMuted }]}>
            {displayBranchName ?? 'Your branch'} · Africa/Lagos
          </Text>
        </View>
        <NotificationBellButton />
      </View>

      {settings.loading && solarCustomer && branchId ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.textOnPageMuted }]}>
            Loading alert settings…
          </Text>
        </View>
      ) : stateMessage ? (
        <View style={styles.stateWrap}>
          <Card>
            <View style={styles.stateCard}>
              <IconSymbol
                name={permissionDenied ? 'person' : 'info.circle'}
                size={28}
                color={colors.textOnCardSecondary}
              />
              <Text style={[styles.stateTitle, { color: colors.textOnCard }]}>
                {permissionDenied
                  ? 'Read-only account'
                  : settingsApiUnavailable
                    ? 'Service unavailable'
                    : 'Settings unavailable'}
              </Text>
              <Text style={[styles.stateBody, { color: colors.textOnCardSecondary }]}>
                {stateMessage}
              </Text>
              {settingsApiUnavailable ? (
                <Pressable
                  onPress={() => void settings.refresh()}
                  style={[styles.retryButton, { backgroundColor: colors.surfaceMuted }]}>
                  <Text style={[styles.retryText, { color: colors.textOnCard }]}>Try again</Text>
                </Pressable>
              ) : null}
            </View>
          </Card>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={settings.refreshing}
              onRefresh={() => void settings.refresh()}
              tintColor={colors.accent}
            />
          }
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 110 },
          ]}>
          <View style={[styles.scopeNote, { backgroundColor: colors.accentMuted }]}>
            <IconSymbol name="info.circle" size={17} color={colors.accent} />
            <Text style={[styles.scopeText, { color: colors.textOnPageMuted }]}>
              Changes apply to everyone with access to this branch.
            </Text>
          </View>

          {settings.error ? (
            <View style={[styles.errorBanner, { backgroundColor: 'rgba(239,68,68,0.12)' }]}>
              <Text style={[styles.errorText, { color: colors.error }]}>{settings.error}</Text>
            </View>
          ) : null}

          {settings.batteryConfig ? (
            <Card>
              <SectionHeading
                icon="battery.100.bolt"
                title="Battery SOC"
                subtitle="Scheduled updates and battery-level rules"
                color="#22C55E"
              />
              <ToggleRow
                title="Battery alerts"
                subtitle="Master switch for all SOC notifications"
                value={settings.batteryConfig.is_enabled}
                disabled={disabled}
                onChange={(value) => void settings.updateBattery({ is_enabled: value })}
              />
              <ToggleRow
                title="Push notifications"
                subtitle="Send push and save it in Notifications"
                value={settings.batteryConfig.push_enabled}
                disabled={disabled}
                onChange={(value) => void settings.updateBattery({ push_enabled: value })}
              />
              <ToggleRow
                title="Email"
                subtitle="Send to the branch email address"
                value={settings.batteryConfig.email_enabled}
                disabled={disabled}
                last
                onChange={(value) => void settings.updateBattery({ email_enabled: value })}
              />

              <View style={[styles.subsection, { borderTopColor: colors.border }]}>
                <View style={styles.subsectionHeader}>
                  <View>
                    <Text style={[styles.subsectionTitle, { color: colors.textOnCard }]}>
                      Scheduled updates
                    </Text>
                    <Text style={[styles.subsectionHint, { color: colors.textOnCardSecondary }]}>
                      Checked every 15 minutes
                    </Text>
                  </View>
                  <AddButton label="Add time" onPress={() => setTimeOpen(true)} disabled={disabled} />
                </View>
                {settings.batteryConfig.schedule_times.length === 0 ? (
                  <EmptyRow text="No scheduled send times yet" />
                ) : (
                  <View style={styles.itemList}>
                    {settings.batteryConfig.schedule_times.map((item) => (
                      <View
                        key={item.id}
                        style={[styles.itemRow, { backgroundColor: colors.surfaceMuted }]}>
                        <View style={styles.itemIcon}>
                          <IconSymbol name="calendar" size={19} color={colors.accent} />
                        </View>
                        <View style={styles.itemCopy}>
                          <Text style={[styles.itemTitle, { color: colors.textOnCard }]}>
                            {displayTime(item.time)}
                          </Text>
                          <Text style={[styles.itemSubtitle, { color: colors.textOnCardSecondary }]}>
                            {daysLabel(item.days_of_week)}
                          </Text>
                        </View>
                        <Pressable
                          onPress={() => deleteTime(item.id, item.time)}
                          disabled={disabled}
                          style={styles.removeButton}>
                          {settings.busy === `time-${item.id}` ? (
                            <ActivityIndicator size="small" color={colors.textOnCardSecondary} />
                          ) : (
                            <IconSymbol name="xmark" size={18} color={colors.textOnCardSecondary} />
                          )}
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              <View style={[styles.subsection, { borderTopColor: colors.border }]}>
                <View style={styles.subsectionHeader}>
                  <View style={styles.headingCopy}>
                    <Text style={[styles.subsectionTitle, { color: colors.textOnCard }]}>
                      SOC threshold rules
                    </Text>
                    <Text style={[styles.subsectionHint, { color: colors.textOnCardSecondary }]}>
                      Fires when battery level crosses a rule
                    </Text>
                  </View>
                  <AddButton
                    label="Add rule"
                    onPress={() => setThresholdOpen(true)}
                    disabled={disabled}
                  />
                </View>
                {settings.batteryConfig.thresholds.length === 0 ? (
                  <EmptyRow text="No battery-level rules yet" />
                ) : (
                  <View style={styles.itemList}>
                    {settings.batteryConfig.thresholds.map((item) => {
                      const lower = item.operator === 'lte';
                      const label = lower
                        ? `Drops to ${item.value}% or below`
                        : `Rises to ${item.value}% or above`;
                      return (
                        <View
                          key={item.id}
                          style={[styles.itemRow, { backgroundColor: colors.surfaceMuted }]}>
                          <View
                            style={[
                              styles.ruleSymbol,
                              {
                                backgroundColor: lower
                                  ? 'rgba(245,158,11,0.14)'
                                  : 'rgba(34,197,94,0.14)',
                              },
                            ]}>
                            <Text style={{ color: lower ? colors.warning : colors.success }}>
                              {lower ? '≤' : '≥'}
                            </Text>
                          </View>
                          <View style={styles.itemCopy}>
                            <Text style={[styles.itemTitle, { color: colors.textOnCard }]}>
                              {label}
                            </Text>
                            <Text style={[styles.itemSubtitle, { color: colors.textOnCardSecondary }]}>
                              Evaluated every 10 minutes
                            </Text>
                          </View>
                          <Pressable
                            onPress={() => deleteThreshold(item.id, label)}
                            disabled={disabled}
                            style={styles.removeButton}>
                            {settings.busy === `threshold-${item.id}` ? (
                              <ActivityIndicator size="small" color={colors.textOnCardSecondary} />
                            ) : (
                              <IconSymbol name="xmark" size={18} color={colors.textOnCardSecondary} />
                            )}
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </Card>
          ) : settings.batteryAvailability === 'unavailable' ? (
            <Card>
              <EmptyRow text="Battery SOC alerts are unavailable because this station has no battery capacity." />
            </Card>
          ) : settings.batteryAvailability === 'forbidden' ? (
            <Card>
              <EmptyRow text="Battery SOC alert settings are restricted for this account." />
            </Card>
          ) : null}

          {settings.capacityConfig ? (
            <Card>
              <SectionHeading
                icon="gauge.with.dots.needle.33percent"
                title="Power demand"
                subtitle="Warn when load approaches inverter capacity"
                color="#F59E0B"
              />
              <ToggleRow
                title="Capacity alert"
                subtitle="Notify when demand reaches the configured level"
                value={settings.capacityConfig.enabled}
                disabled={disabled}
                last
                onChange={(value) => void settings.updateCapacity({ enabled: value })}
              />
              <View style={[styles.capacityEditor, { borderTopColor: colors.border }]}>
                <Text style={[styles.inputLabel, { color: colors.textOnCard }]}>
                  Alert at capacity utilization
                </Text>
                <View style={styles.stepper}>
                  <Pressable
                    onPress={() => setCapacityDraft((value) => Math.max(0, value - 5))}
                    style={[styles.stepButton, { backgroundColor: colors.surfaceMuted }]}>
                    <Text style={[styles.stepSymbol, { color: colors.textOnCard }]}>−</Text>
                  </Pressable>
                  <View style={styles.capacityValue}>
                    <Text style={[styles.capacityNumber, { color: colors.textOnCard }]}>
                      {capacityDraft}%
                    </Text>
                    <Text style={[styles.capacityCaption, { color: colors.textOnCardSecondary }]}>
                      of inverter capacity
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => setCapacityDraft((value) => Math.min(100, value + 5))}
                    style={[styles.stepButton, { backgroundColor: colors.surfaceMuted }]}>
                    <Text style={[styles.stepSymbol, { color: colors.textOnCard }]}>+</Text>
                  </Pressable>
                </View>
                <Pressable
                  onPress={() => void settings.updateCapacity({ threshold_pct: capacityDraft })}
                  disabled={!capacityChanged || disabled}
                  style={[
                    styles.capacitySave,
                    {
                      backgroundColor:
                        capacityChanged && !disabled ? colors.accent : colors.surfaceMuted,
                    },
                  ]}>
                  {settings.busy === 'capacity' ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.capacitySaveText,
                        {
                          color:
                            capacityChanged && !disabled
                              ? colors.textOnAccent
                              : colors.textOnCardSecondary,
                        },
                      ]}>
                      {capacityChanged ? 'Save threshold' : 'Threshold saved'}
                    </Text>
                  )}
                </Pressable>
                <Text style={[styles.evaluationNote, { color: colors.textOnCardSecondary }]}>
                  Evaluated every 10 minutes and resets after demand drops below the threshold.
                </Text>
              </View>
            </Card>
          ) : settings.capacityAvailability === 'unavailable' ? (
            <Card>
              <EmptyRow text="Power-demand alerts are unavailable because this station has no inverter capacity." />
            </Card>
          ) : settings.capacityAvailability === 'forbidden' ? (
            <Card>
              <EmptyRow text="Power-demand alert settings are restricted for this account." />
            </Card>
          ) : null}
        </ScrollView>
      )}

      <TimeModal
        visible={timeOpen}
        saving={settings.busy === 'add-time'}
        onClose={() => setTimeOpen(false)}
        onSave={(time, days) => {
          void settings.addTime(time, days).then((saved) => {
            if (saved) setTimeOpen(false);
          });
        }}
      />
      <ThresholdModal
        visible={thresholdOpen}
        saving={settings.busy === 'add-threshold'}
        onClose={() => setThresholdOpen(false)}
        onSave={(operator, value) => {
          void settings.addThreshold(operator, value).then((saved) => {
            if (saved) setThresholdOpen(false);
          });
        }}
      />
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
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { fontSize: 14 },
  stateWrap: { paddingHorizontal: 16 },
  stateCard: { alignItems: 'center', paddingVertical: 18, paddingHorizontal: 14, gap: 8 },
  stateTitle: { fontSize: 18, fontWeight: '800' },
  stateBody: { fontSize: 14, lineHeight: 20, textAlign: 'center' },
  retryButton: {
    minHeight: 42,
    marginTop: 5,
    borderRadius: 13,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  retryText: { fontSize: 13, fontWeight: '800' },
  content: { paddingHorizontal: 16, gap: 14 },
  card: { borderRadius: 22, padding: 16 },
  scopeNote: {
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  scopeText: { flex: 1, fontSize: 12, lineHeight: 17 },
  errorBanner: { borderRadius: 14, padding: 12 },
  errorText: { fontSize: 13, lineHeight: 18, fontWeight: '600' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 12 },
  headingIcon: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  headingCopy: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '800' },
  sectionSubtitle: { marginTop: 2, fontSize: 12, lineHeight: 16 },
  toggleRow: {
    minHeight: 66,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  toggleCopy: { flex: 1, paddingVertical: 10 },
  toggleTitle: { fontSize: 14, fontWeight: '700' },
  toggleSubtitle: { marginTop: 3, fontSize: 11, lineHeight: 15 },
  subsection: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 12, paddingTop: 16 },
  subsectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 11 },
  subsectionTitle: { fontSize: 15, fontWeight: '800' },
  subsectionHint: { marginTop: 2, fontSize: 10, lineHeight: 14 },
  addButton: { minHeight: 34, borderRadius: 12, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 5 },
  addButtonText: { fontSize: 11, fontWeight: '800' },
  emptyRow: { minHeight: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  emptyRowText: { fontSize: 12, textAlign: 'center' },
  itemList: { gap: 8 },
  itemRow: { minHeight: 58, borderRadius: 15, paddingHorizontal: 11, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 9 },
  itemIcon: { width: 30, alignItems: 'center' },
  itemCopy: { flex: 1 },
  itemTitle: { fontSize: 13, fontWeight: '700' },
  itemSubtitle: { marginTop: 2, fontSize: 10, lineHeight: 14 },
  removeButton: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  ruleSymbol: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  capacityEditor: { borderTopWidth: StyleSheet.hairlineWidth, marginTop: 12, paddingTop: 16 },
  inputLabel: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 17 },
  stepButton: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  stepSymbol: { fontSize: 24, lineHeight: 28, fontWeight: '500' },
  capacityValue: { minWidth: 120, alignItems: 'center' },
  capacityNumber: { fontSize: 31, fontWeight: '800' },
  capacityCaption: { marginTop: 1, fontSize: 10 },
  capacitySave: { minHeight: 46, borderRadius: 14, marginTop: 16, alignItems: 'center', justifyContent: 'center' },
  capacitySaveText: { fontSize: 13, fontWeight: '800' },
  evaluationNote: { marginTop: 10, fontSize: 10, lineHeight: 15, textAlign: 'center' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end' },
  modalBackdrop: { flex: 1 },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20 },
  modalHandle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, marginTop: 10, marginBottom: 12 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  modalSubtitle: { marginTop: 3, fontSize: 12 },
  modalClose: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  days: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  day: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 12, fontWeight: '800' },
  primaryButton: { minHeight: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  operatorTabs: { flexDirection: 'row', padding: 4, borderRadius: 14, marginVertical: 16 },
  operatorTab: { flex: 1, minHeight: 42, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  operatorText: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  percentInput: { minHeight: 64, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  percentInputText: { minWidth: 70, fontSize: 30, fontWeight: '800', textAlign: 'right', padding: 0 },
  percentSymbol: { fontSize: 23, fontWeight: '700', marginLeft: 4 },
  faded: { opacity: 0.55 },
});
