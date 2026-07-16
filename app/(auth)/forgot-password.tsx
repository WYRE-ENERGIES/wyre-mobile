import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AuthTextField } from '@/components/auth/auth-text-field';
import { WyreColors } from '@/constants/theme';
import { validateEmail } from '@/lib/auth-validation';
import { resetPasswordAction } from '@/redux/actions/auth/auth.action';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

export default function ForgotPasswordScreen() {
  const dispatch = useAppDispatch();
  const resetPasswordLoading = useAppSelector((state) => state.auth.resetPasswordLoading);

  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [touched, setTouched] = useState(false);

  const onReset = async () => {
    setFormError('');
    setTouched(true);
    const validationError = validateEmail(email);
    setEmailError(validationError);
    if (validationError) return;

    const result = await dispatch(resetPasswordAction({ email: email.trim() }));

    if (!result.fulfilled) {
      setFormError(result.message);
      return;
    }

    setSuccessMessage(result.message);
    setSent(true);
  };

  return (
    <AuthScreen
      footer={
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backRow, pressed && styles.pressed]}
          hitSlop={8}>
          <MaterialIcons name="chevron-left" size={22} color={WyreColors.purple} />
          <Text style={styles.backText}>Back to login</Text>
        </Pressable>
      }>
      <View style={styles.header}>
        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.subtitle}>
          Enter the email address linked to your account. We will send instructions to reset your
          password.
        </Text>
      </View>

      {sent ? (
        <View style={styles.successCard}>
          <View style={styles.successIcon}>
            <MaterialIcons name="mark-email-read" size={28} color={WyreColors.purple} />
          </View>
          <Text style={styles.successTitle}>Check your email</Text>
          <Text style={styles.successBody}>
            {successMessage ||
              `If an account exists for ${email.trim()}, you will receive reset instructions shortly.`}
          </Text>
          <AuthButton title="Back to login" onPress={() => router.replace('/(auth)/login')} />
        </View>
      ) : (
        <View style={styles.form}>
          <AuthTextField
            label="Email address"
            placeholder="name@company.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setFormError('');
              if (touched) {
                setEmailError(validateEmail(text));
              }
            }}
            onBlur={() => {
              setTouched(true);
              setEmailError(validateEmail(email));
            }}
            error={touched ? emailError : undefined}
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
            returnKeyType="send"
            onSubmitEditing={onReset}
            maxLength={100}
          />

          {formError ? <Text style={styles.error}>{formError}</Text> : null}

          <AuthButton
            title="Reset password"
            onPress={onReset}
            loading={resetPasswordLoading}
            style={styles.submit}
          />
        </View>
      )}
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: WyreColors.textPrimary,
    letterSpacing: -0.8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: WyreColors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  form: {
    gap: 14,
  },
  error: {
    fontSize: 14,
    color: WyreColors.error,
    textAlign: 'center',
  },
  submit: {
    marginTop: 6,
  },
  successCard: {
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#F5F0FA',
    borderRadius: 20,
    padding: 24,
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(92, 18, 167, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: WyreColors.textPrimary,
    letterSpacing: -0.3,
  },
  successBody: {
    fontSize: 15,
    lineHeight: 22,
    color: WyreColors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: WyreColors.purple,
  },
  pressed: {
    opacity: 0.6,
  },
});
