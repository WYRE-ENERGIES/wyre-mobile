import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { WyreColors } from '@/constants/theme';

type DatePickerButtonProps = {
  value: Date;
  onChange: (date: Date) => void;
  maximumDate?: Date;
};

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function DatePickerButton({ value, onChange, maximumDate }: DatePickerButtonProps) {
  const insets = useSafeAreaInsets();
  const [showPicker, setShowPicker] = useState(false);
  const [draftDate, setDraftDate] = useState(value);

  useEffect(() => {
    if (showPicker) setDraftDate(value);
  }, [showPicker, value]);

  const openPicker = () => {
    setDraftDate(value);
    setShowPicker(true);
  };

  const handleAndroidChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowPicker(false);
    if (event.type === 'dismissed' || !selectedDate) return;
    onChange(selectedDate);
  };

  const confirmIos = () => {
    onChange(draftDate);
    setShowPicker(false);
  };

  return (
    <>
      <Pressable style={styles.button} onPress={openPicker}>
        <Text style={styles.buttonText}>{formatDisplayDate(value)}</Text>
      </Pressable>

      {Platform.OS === 'android' && showPicker ? (
        <DateTimePicker
          value={value}
          mode="date"
          display="default"
          maximumDate={maximumDate}
          onChange={handleAndroidChange}
        />
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showPicker}
          transparent
          animationType="slide"
          presentationStyle="overFullScreen"
          onRequestClose={() => setShowPicker(false)}>
          <View style={styles.modalRoot}>
            <Pressable style={styles.modalBackdrop} onPress={() => setShowPicker(false)} />
            <View style={[styles.modalSheet, { paddingBottom: Math.max(insets.bottom, 16) }]}>
              <View style={styles.modalActions}>
                <Pressable onPress={() => setShowPicker(false)} hitSlop={8}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
                <Text style={styles.modalTitle}>Select date</Text>
                <Pressable onPress={confirmIos} hitSlop={8}>
                  <Text style={styles.doneText}>Done</Text>
                </Pressable>
              </View>
              <View style={styles.iosPickerWrap}>
                <DateTimePicker
                  value={draftDate}
                  mode="date"
                  display="inline"
                  themeVariant="light"
                  accentColor={WyreColors.purple}
                  maximumDate={maximumDate}
                  onChange={(_event, selectedDate) => {
                    if (selectedDate) setDraftDate(selectedDate);
                  }}
                  style={styles.iosPicker}
                />
              </View>
            </View>
          </View>
        </Modal>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: WyreColors.border,
    backgroundColor: WyreColors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 13,
    color: WyreColors.textPrimary,
  },
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  modalActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: WyreColors.border,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: WyreColors.textPrimary,
  },
  cancelText: {
    fontSize: 16,
    color: WyreColors.textSecondary,
    minWidth: 64,
  },
  doneText: {
    fontSize: 16,
    fontWeight: '600',
    color: WyreColors.purple,
    minWidth: 64,
    textAlign: 'right',
  },
  iosPickerWrap: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 4,
  },
  iosPicker: {
    width: '100%',
    alignSelf: 'center',
  },
});
