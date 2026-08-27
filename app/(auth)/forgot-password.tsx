import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AuthTextField } from '@/components/auth/auth-text-field';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/context/theme-context';
import { validateEmail } from '@/lib/auth-validation';
import { resetPasswordAction } from '@/redux/actions/auth/auth.action';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

const ACCENT_DARK = '#6e11cb'
const ACCENT_LIGHT = '#5C12A7'

export default function ForgotPasswordScreen() {
  const dispatch = useAppDispatch();
  const { colors, isDark } = useAppTheme();
  const resetPasswordLoading = useAppSelector((state) => state.auth.resetPasswordLoading);
  const secondaryText = isDark ? '#FFFFFF' : colors.textOnPage;
  const accent = isDark ? ACCENT_DARK : ACCENT_LIGHT;
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
      showHouse={false}
      contentPosition="center"
      footer={
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backRow, pressed && styles.pressed]}
          hitSlop={8}>
          <IconSymbol name="chevron.left" size={22} color={secondaryText} />
          <Text style={[styles.backText, { color: secondaryText }]}>Back to login</Text>
        </Pressable>
      }>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.textOnPage }]}>Reset password</Text>
        <Text style={[styles.subtitle, { color: colors.textOnPageMuted }]}>
          Enter the email address linked to your account. We will send instructions to reset your
          password.
        </Text>
      </View>

      {sent ? (
        <View
          style={[
            styles.successCard,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
            },
          ]}>
          <View style={[styles.successIcon, { backgroundColor: `${colors.success}1A` }]}>
            <IconSymbol name="envelope.open.fill" size={28} color={colors.success} />
          </View>
          <Text style={[styles.successTitle, { color: colors.textOnPage }]}>Check your email</Text>
          <Text style={[styles.successBody, { color: colors.textOnPageMuted }]}>
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
            tone="neutral"
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

          {formError ? <Text style={[styles.error, { color: colors.error }]}>{formError}</Text> : null}

          <AuthButton
            title="Reset password"
            onPress={onReset}
            loading={resetPasswordLoading}
            style={styles.submit}
            accent={accent}
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
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: 4,
  },
  form: {
    gap: 14,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
  },
  submit: {
    marginTop: 10,
    minHeight: 62,
    borderRadius: 999,
  },
  successCard: {
    gap: 12,
    alignItems: 'center',
    borderRadius: 20,
    padding: 24,
  },
  successIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  successBody: {
    fontSize: 15,
    lineHeight: 22,
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
  },
  pressed: {
    opacity: 0.6,
  },
});
