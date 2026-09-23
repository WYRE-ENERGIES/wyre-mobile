import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/auth-button';
import { ReportDateField } from '@/components/reports/report-date-fields';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/context/theme-context';
import type {
  BranchGenerator,
  DieselDailyUsageEntry,
  DieselEntryKind,
  DieselMonthlyUsageEntry,
} from '@/lib/diesel-entry-types';
import { toISODate } from '@/lib/report/helpers';

type EditTarget =
  | { kind: 'daily'; entry: DieselDailyUsageEntry }
  | { kind: 'monthly'; entry: DieselMonthlyUsageEntry };

type DieselEntryEditSheetProps = {
  visible: boolean;
  target: EditTarget | null;
  generators: BranchGenerator[];
  saving: boolean;
  onClose: () => void;
  onSaveDaily: (input: {
    entryId: number;
    quantity: number;
    startDate: string;
    endDate: string;
    generatorIds?: number[];
  }) => Promise<boolean>;
  onSaveMonthly: (input: {
    entryId: number;
    quantity: number;
    startDate: string;
    endDate: string;
  }) => Promise<boolean>;
};

export function DieselEntryEditSheet({
  visible,
  target,
  generators,
  saving,
  onClose,
  onSaveDaily,
  onSaveMonthly,
}: DieselEntryEditSheetProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const [startDate, setStartDate] = useState(toISODate(new Date()));
  const [endDate, setEndDate] = useState(toISODate(new Date()));
  const [quantity, setQuantity] = useState('');
  const [generatorId, setGeneratorId] = useState<number | null>(null);

  useEffect(() => {
    if (!target) return;
    if (target.kind === 'daily') {
      setStartDate(target.entry.startDate);
      setEndDate(target.entry.endDate || target.entry.startDate);
      setQuantity(String(target.entry.quantity));
      setGeneratorId(target.entry.generatorIds[0] ?? null);
      return;
    }
    setStartDate(target.entry.startDate ?? toISODate(new Date()));
    setEndDate(target.entry.endDate ?? toISODate(new Date()));
    setQuantity(String(target.entry.quantity));
    setGeneratorId(null);
  }, [target]);

  const kind: DieselEntryKind | null = target?.kind ?? null;
  const today = useMemo(() => new Date(), []);

  const save = async () => {
    if (!target?.entry.id) {
      Alert.alert('This entry cannot be edited.');
      return;
    }
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

    const ok =
      target.kind === 'daily'
        ? await onSaveDaily({
            entryId: target.entry.id,
            quantity: amount,
            startDate,
            endDate: resolvedEnd,
            generatorIds: generatorId != null ? [generatorId] : undefined,
          })
        : await onSaveMonthly({
            entryId: target.entry.id,
            quantity: amount,
            startDate,
            endDate: resolvedEnd,
          });

    if (ok) onClose();
    else Alert.alert('Update failed', 'Could not save changes. Please try again.');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            { backgroundColor: colors.surface, paddingBottom: insets.bottom + 18 },
          ]}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
          <View style={styles.header}>
            <View style={styles.headerCopy}>
              <Text style={[styles.title, { color: colors.textOnCard }]}>
                Update {kind === 'monthly' ? 'monthly' : 'daily'} entry
              </Text>
              <Text style={[styles.subtitle, { color: colors.textOnCardSecondary }]}>
                Editable for 30 minutes after it was recorded
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              style={[styles.close, { backgroundColor: colors.surfaceMuted }]}>
              <IconSymbol name="xmark" size={18} color={colors.textOnCard} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.form} keyboardShouldPersistTaps="handled">
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
                placeholder="0"
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

            {kind === 'daily' && generators.length > 0 ? (
              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textOnCardSecondary }]}>
                  Generator
                </Text>
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
                            backgroundColor: selected ? colors.accent : colors.surfaceMuted,
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
              </View>
            ) : null}

            <AuthButton title="Save changes" onPress={() => void save()} loading={saving} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '88%',
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 999,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 14,
    paddingBottom: 8,
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
});
