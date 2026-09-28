import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/context/theme-context';
import { formatDisplayDate, parseISODate, toISODate } from '@/lib/report/helpers';

type DateFieldProps = {
  label: string;
  value: string;
  onChange: (isoDate: string) => void;
  maximumDate?: Date;
  style?: StyleProp<ViewStyle>;
};

export function ReportDateField({
  label,
  value,
  onChange,
  maximumDate,
  style,
}: DateFieldProps) {
  const { colors, isDark } = useAppTheme();
  const [open, setOpen] = useState(false);
  const selected = parseISODate(value) || new Date();

  return (
    <View style={[styles.field, style]}>
      <Text style={[styles.label, { color: colors.textOnCardSecondary }]}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.selector,
          { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
          pressed && styles.pressed,
        ]}>
        <Text
          style={[
            styles.selectorText,
            { color: value ? colors.textOnCard : colors.textOnCardSecondary },
          ]}>
          {value ? formatDisplayDate(value) : 'Select date'}
        </Text>
        <IconSymbol name="calendar" size={18} color={colors.accent} />
      </Pressable>

      {open ? (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="slide" visible={open} onRequestClose={() => setOpen(false)}>
            <Pressable
              style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}
              onPress={() => setOpen(false)}
            />
            <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, { color: colors.textOnCard }]}>{label}</Text>
                <Pressable onPress={() => setOpen(false)}>
                  <Text style={[styles.done, { color: colors.accent }]}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={selected}
                mode="date"
                display="spinner"
                themeVariant={isDark ? 'dark' : 'light'}
                maximumDate={maximumDate}
                onChange={(_, date) => {
                  if (date) onChange(toISODate(date));
                }}
              />
            </View>
          </Modal>
        ) : (
          <DateTimePicker
            value={selected}
            mode="date"
            display="default"
            maximumDate={maximumDate}
            onChange={(event, date) => {
              setOpen(false);
              if (event.type === 'set' && date) onChange(toISODate(date));
            }}
          />
        )
      ) : null}
    </View>
  );
}

type MonthYearProps = {
  month: number;
  year: number;
  onChangeMonth: (month: number) => void;
  onChangeYear: (year: number) => void;
  monthOptions: { value: number; label: string; disabled?: boolean }[];
  yearOptions: number[];
};

export function ReportMonthYearFields({
  month,
  year,
  onChangeMonth,
  onChangeYear,
  monthOptions,
  yearOptions,
}: MonthYearProps) {
  const { colors, isDark } = useAppTheme();
  const [activeField, setActiveField] = useState<'month' | 'year' | null>(null);
  const selectedMonth = monthOptions.find((option) => option.value === month)?.label ?? String(month);

  return (
    <>
      <View style={styles.row}>
        <View style={[styles.field, styles.half]}>
          <Text style={[styles.label, { color: colors.textOnCardSecondary }]}>Month</Text>
          <Pressable
            onPress={() => setActiveField('month')}
            style={({ pressed }) => [
              styles.selector,
              { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.selectorText, { color: colors.textOnCard }]}>{selectedMonth}</Text>
            <IconSymbol name="calendar" size={18} color={colors.accent} />
          </Pressable>
        </View>
        <View style={[styles.field, styles.half]}>
          <Text style={[styles.label, { color: colors.textOnCardSecondary }]}>Year</Text>
          <Pressable
            onPress={() => setActiveField('year')}
            style={({ pressed }) => [
              styles.selector,
              { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
              pressed && styles.pressed,
            ]}>
            <Text style={[styles.selectorText, { color: colors.textOnCard }]}>{year}</Text>
            <IconSymbol name="calendar" size={18} color={colors.accent} />
          </Pressable>
        </View>
      </View>

      <Modal
        transparent
        animationType="slide"
        visible={activeField !== null}
        onRequestClose={() => setActiveField(null)}>
        <Pressable
          style={[styles.modalBackdrop, { backgroundColor: colors.overlay }]}
          onPress={() => setActiveField(null)}
        />
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={styles.sheetHeader}>
            <Text style={[styles.sheetTitle, { color: colors.textOnCard }]}>
              Select {activeField}
            </Text>
            <Pressable onPress={() => setActiveField(null)}>
              <Text style={[styles.done, { color: colors.accent }]}>Done</Text>
            </Pressable>
          </View>
          <Picker
            selectedValue={activeField === 'month' ? month : year}
            onValueChange={(value) => {
              if (activeField === 'month') onChangeMonth(Number(value));
              if (activeField === 'year') onChangeYear(Number(value));
            }}
            style={[styles.modalPicker, { color: colors.textOnCard }]}
            itemStyle={[styles.pickerItem, { color: colors.textOnCard }]}>
            {activeField === 'month'
              ? monthOptions
                  .filter((option) => !option.disabled)
                  .map((option) => (
                    <Picker.Item
                      key={option.value}
                      label={option.label}
                      value={option.value}
                      color={isDark ? colors.textOnCard : undefined}
                    />
                  ))
              : yearOptions.map((option) => (
                <Picker.Item
                  key={option}
                  label={String(option)}
                  value={option}
                  color={isDark ? colors.textOnCard : undefined}
                />
              ))}
          </Picker>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  selector: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorText: {
    fontSize: 15,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.85,
  },
  modalBackdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingBottom: 20,
  },
  sheetHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  done: {
    fontSize: 16,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  half: {
    flex: 1,
  },
  modalPicker: {
    width: '100%',
    height: 190,
  },
  pickerItem: {
    fontSize: 16,
    height: 190,
  },
});
