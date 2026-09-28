import { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/context/theme-context';

type AuthTextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  isPassword?: boolean;
  tone?: 'purple' | 'neutral';
};

export function AuthTextField({
  label,
  error,
  isPassword = false,
  tone = 'purple',
  style,
  ...props
}: AuthTextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(isPassword);
  const { colors, isDark } = useAppTheme();

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text style={[styles.label, { color: isDark ? colors.textOnPageMuted : colors.textSecondary }]}>
          {label}
        </Text>
      ) : null}
      <View
        style={[
          styles.field,
          {
            backgroundColor: isDark
              ? tone === 'neutral'
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(112, 77, 139, 0.58)'
              : '#fff',
            borderColor: isDark
              ? tone === 'neutral'
                ? 'rgba(255,255,255,0.3)'
                : 'rgba(255,255,255,0.5)'
              : colors.inputBorder,
          },
          focused && { borderColor: colors.accent },
          !!error && { borderColor: colors.error },
        ]}>
        <TextInput
          {...props}
          secureTextEntry={secure}
          placeholderTextColor={isDark ? 'rgba(255,255,255,0.52)' : '#9CA3AF'}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={[
            styles.input,
            { color: isDark ? colors.textOnPage : colors.textOnCard },
            style,
          ]}
          autoCapitalize={props.autoCapitalize ?? 'none'}
          autoCorrect={props.autoCorrect ?? false}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setSecure((prev) => !prev)}
            hitSlop={10}
            style={({ pressed }) => [styles.eyeBtn, pressed && styles.pressed]}>
            <IconSymbol
              name={secure ? 'eye.slash' : 'eye'}
              size={22}
              color={isDark ? 'rgba(255,255,255,0.55)' : '#9CA3AF'}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginLeft: 2,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 22,
    minHeight: 62,
    zIndex: 1,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    includeFontPadding: false,
  },
  eyeBtn: {
    marginLeft: 8,
    padding: 4,
  },
  pressed: {
    opacity: 0.6,
  },
  error: {
    fontSize: 13,
    marginLeft: 2,
  },
});
