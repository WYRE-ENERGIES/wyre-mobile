import type { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useEffect, useRef, type CSSProperties } from 'react';

import { useAppTheme } from '@/context/theme-context';

export type { DateTimePickerEvent };

type WebDateTimePickerProps = {
  value: Date;
  mode?: 'date' | 'time';
  onChange?: (event: DateTimePickerEvent, date?: Date) => void;
  maximumDate?: Date;
  minimumDate?: Date;
  minuteInterval?: number;
  /** Open the browser's picker as soon as the field mounts (where supported). */
  autoOpen?: boolean;
  style?: CSSProperties;
  // Accepted for API parity with the native picker; ignored on web.
  display?: string;
  is24Hour?: boolean;
  themeVariant?: 'dark' | 'light';
  textColor?: string;
  testID?: string;
};

const pad = (n: number) => String(n).padStart(2, '0');
const toDateValue = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const toTimeValue = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

function makeEvent(type: DateTimePickerEvent['type'], date?: Date): DateTimePickerEvent {
  return {
    type,
    nativeEvent: { timestamp: date ? date.getTime() : Date.now(), utcOffset: 0 },
  } as DateTimePickerEvent;
}

/**
 * Web stand-in for @react-native-community/datetimepicker.
 * Same core props (value, mode, onChange(event, date), minimum/maximumDate,
 * minuteInterval); renders a native browser date/time input styled to match.
 */
export default function DateTimePicker({
  value,
  mode = 'date',
  onChange,
  maximumDate,
  minimumDate,
  minuteInterval,
  autoOpen,
  style,
  themeVariant,
  testID,
}: WebDateTimePickerProps) {
  const { colors, isDark } = useAppTheme();
  const ref = useRef<HTMLInputElement>(null);
  const isTime = mode === 'time';

  useEffect(() => {
    if (!autoOpen) return;
    try {
      ref.current?.focus();
      ref.current?.showPicker?.();
    } catch {
      // showPicker needs a recent user gesture; the visible field still works.
    }
  }, [autoOpen]);

  const inputValue = isTime ? toTimeValue(value) : toDateValue(value);

  return (
    <input
      ref={ref}
      data-testid={testID}
      type={isTime ? 'time' : 'date'}
      value={inputValue}
      max={!isTime && maximumDate ? toDateValue(maximumDate) : undefined}
      min={!isTime && minimumDate ? toDateValue(minimumDate) : undefined}
      step={isTime && minuteInterval ? minuteInterval * 60 : undefined}
      onClick={(event) => {
        // Desktop browsers only open the picker from the icon; open it on any click.
        try {
          event.currentTarget.showPicker?.();
        } catch {
          // ignore
        }
      }}
      onChange={(event) => {
        const raw = event.currentTarget.value;
        if (!raw) {
          onChange?.(makeEvent('dismissed'), undefined);
          return;
        }
        const next = new Date(value.getTime());
        if (isTime) {
          const [h, m] = raw.split(':').map(Number);
          next.setHours(h, m, 0, 0);
        } else {
          const [y, mo, d] = raw.split('-').map(Number);
          next.setFullYear(y, mo - 1, d);
        }
        onChange?.(makeEvent('set', next), next);
      }}
      style={{
        boxSizing: 'border-box',
        width: '100%',
        minHeight: 48,
        padding: '0 14px',
        borderRadius: 12,
        border: `1.5px solid ${colors.border}`,
        background: colors.surfaceMuted,
        color: colors.textOnCard,
        fontSize: 16,
        fontWeight: 500,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        margin: '4px 0',
        colorScheme: (themeVariant ?? (isDark ? 'dark' : 'light')) as CSSProperties['colorScheme'],
        accentColor: colors.accent,
        outline: 'none',
        ...style,
      }}
    />
  );
}
