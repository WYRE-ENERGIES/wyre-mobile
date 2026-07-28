import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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

import { WyreColors } from '@/constants/theme';
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
  const [open, setOpen] = useState(false);
  const selected = parseISODate(value) || new Date();

  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [styles.selector, pressed && styles.pressed]}>
        <Text style={[styles.selectorText, !value && styles.placeholder]}>
          {value ? formatDisplayDate(value) : 'Select date'}
        </Text>
        <MaterialIcons name="calendar-today" size={18} color={WyreColors.purple} />
      </Pressable>

      {open ? (
        Platform.OS === 'ios' ? (
          <Modal transparent animationType="slide" visible={open} onRequestClose={() => setOpen(false)}>
            <Pressable style={styles.modalBackdrop} onPress={() => setOpen(false)} />
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>{label}</Text>
                <Pressable onPress={() => setOpen(false)}>
                  <Text style={styles.done}>Done</Text>
                </Pressable>
              </View>
              <DateTimePicker
                value={selected}
                mode="date"
                display="spinner"
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
  return (
    <View style={styles.row}>
      <View style={[styles.field, styles.half]}>
        <Text style={styles.label}>Year</Text>
        <View style={styles.pickerShell}>
          <Picker
            selectedValue={year}
            onValueChange={(value) => onChangeYear(Number(value))}
            style={styles.picker}
            itemStyle={styles.pickerItem}>
            {yearOptions.map((option) => (
              <Picker.Item key={option} label={String(option)} value={option} />
            ))}
          </Picker>
        </View>
      </View>
      <View style={[styles.field, styles.half]}>
        <Text style={styles.label}>Month</Text>
        <View style={styles.pickerShell}>
          <Picker
            selectedValue={month}
            onValueChange={(value) => onChangeMonth(Number(value))}
            style={styles.picker}
            itemStyle={styles.pickerItem}>
            {monthOptions
              .filter((option) => !option.disabled)
              .map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
          </Picker>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: WyreColors.textSecondary,
  },
  selector: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(92, 18, 167, 0.14)',
    backgroundColor: '#F5F0FA',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorText: {
    fontSize: 15,
    fontWeight: '500',
    color: WyreColors.textPrimary,
  },
  placeholder: {
    color: '#9CA3AF',
  },
  pressed: {
    opacity: 0.85,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
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
    color: WyreColors.textPrimary,
  },
  done: {
    fontSize: 16,
    fontWeight: '600',
    color: WyreColors.purple,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  half: {
    flex: 1,
  },
  pickerShell: {
    height: 100,
    borderRadius: 12,
    backgroundColor: 'linear-gradient(180deg, #F5F0FA 0%, #F5F0FA 100%)',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    height: 120,
    color: WyreColors.textPrimary,
  },
  pickerItem: {
    fontSize: 16,
    height: 120,
  },
  helper: {
    fontSize: 12,
    color: WyreColors.textSecondary,
  },
});
