import MaterialIcons from '@expo/vector-icons/MaterialIcons';
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

import { WyreColors } from '@/constants/theme';

type AuthTextFieldProps = TextInputProps & {
  label?: string;
  error?: string;
  isPassword?: boolean;
};

export function AuthTextField({
  label,
  error,
  isPassword = false,
  style,
  ...props
}: AuthTextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [secure, setSecure] = useState(isPassword);

  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.field,
          focused && styles.fieldFocused,
          !!error && styles.fieldError,
        ]}>
        <TextInput
          {...props}
          secureTextEntry={secure}
          placeholderTextColor="#9CA3AF"
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={[styles.input, style]}
          autoCapitalize={props.autoCapitalize ?? 'none'}
          autoCorrect={props.autoCorrect ?? false}
        />
        {isPassword ? (
          <Pressable
            onPress={() => setSecure((prev) => !prev)}
            hitSlop={10}
            style={({ pressed }) => [styles.eyeBtn, pressed && styles.pressed]}>
            <MaterialIcons
              name={secure ? 'visibility-off' : 'visibility'}
              size={22}
              color="#9CA3AF"
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
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
    color: WyreColors.textSecondary,
    letterSpacing: 0.2,
    marginLeft: 2,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F0FA',
    borderWidth: 1.5,
    borderColor: 'rgba(92, 18, 167, 0.14)',
    borderRadius: 14,
    paddingHorizontal: 16,
    minHeight: 54,
  },
  fieldFocused: {
    borderColor: WyreColors.purple,
    backgroundColor: '#FAF7FD',
  },
  fieldError: {
    borderColor: WyreColors.error,
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: '500',
    color: WyreColors.textPrimary,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    // Avoid Android focus flickers from elevation layout changes
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
    color: WyreColors.error,
    marginLeft: 2,
  },
});
