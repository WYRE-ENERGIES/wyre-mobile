import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AuthTextField } from '@/components/auth/auth-text-field';
import { useAppTheme } from '@/context/theme-context';
import { validatePassword, validateUsername } from '@/lib/auth-validation';
import { loginAUser } from '@/redux/actions/auth/auth.action';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

type FieldErrors = {
  username?: string;
  password?: string;
};

const ACCENT_DARK = '#6e11cb'
const ACCENT_LIGHT = '#5C12A7'

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { width } = useWindowDimensions();
  const { colors, isDark } = useAppTheme();
  const loginUserLoading = useAppSelector((state) => state.auth.loginUserLoading);
  const watermarkSize = Math.round(width * 0.27);
  const accent = isDark ? ACCENT_DARK : ACCENT_LIGHT;
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [touched, setTouched] = useState({ username: false, password: false });

  const validateAll = (): boolean => {
    const next: FieldErrors = {
      username: validateUsername(username),
      password: validatePassword(password),
    };
    setFieldErrors(next);
    setTouched({ username: true, password: true });
    return !next.username && !next.password;
  };

  const onLogin = async () => {
    setFormError('');
    if (!validateAll()) return;

    const result = await dispatch(
      loginAUser({
        username: username.trim(),
        password,
      }),
    );

    if (!result.fulfilled) {
      setFormError(result.message || 'Invalid username or password.');
      return;
    }

    router.replace('/(tabs)');
  };

  return (
    <AuthScreen contentGap={0}>
      <View style={styles.header}>
        <View pointerEvents="none" style={styles.watermarkWrap}>
          {['Solar', 'Monitor'].map((line) => (
            <Text
              key={line}
              numberOfLines={1}
              style={[
                styles.watermark,
                {
                  color: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(17,24,39,0.05)',
                  fontSize: watermarkSize,
                  lineHeight: watermarkSize * 1.04,
                },
              ]}>
              {line}
            </Text>
          ))}
        </View>
        <Text style={[styles.title, { color: colors.textOnPage }]}>Welcome Back</Text>
      </View>

      <View style={styles.form}>
        <View>
          <AuthTextField
            placeholder="Username"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              setFormError('');
              if (touched.username) {
                setFieldErrors((prev) => ({ ...prev, username: validateUsername(text) }));
              }
            }}
            onBlur={() => {
              setTouched((prev) => ({ ...prev, username: true }));
              setFieldErrors((prev) => ({ ...prev, username: validateUsername(username) }));
            }}
            error={touched.username ? fieldErrors.username : undefined}
            textContentType="username"
            autoComplete="username"
            returnKeyType="next"
            maxLength={40}
          />
        </View>

        <View style={styles.passwordField}>
          <AuthTextField
            placeholder="Password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setFormError('');
              if (touched.password) {
                setFieldErrors((prev) => ({ ...prev, password: validatePassword(text) }));
              }
            }}
            onBlur={() => {
              setTouched((prev) => ({ ...prev, password: true }));
              setFieldErrors((prev) => ({ ...prev, password: validatePassword(password) }));
            }}
            error={touched.password ? fieldErrors.password : undefined}
            isPassword
            textContentType="password"
            autoComplete="password"
            returnKeyType="go"
            onSubmitEditing={onLogin}
            maxLength={60}
          />
        </View>

        <Pressable
          onPress={() => router.push('/(auth)/forgot-password')}
          style={({ pressed }) => [styles.forgotBtn, pressed && styles.pressed]}
          hitSlop={8}>
          <Text
            style={[
              styles.forgotText,
              { color: isDark ? '#C184FF' : '#5C12A7' },
            ]}>
            Forgot Password ?
          </Text>
        </Pressable>

        {formError ? <Text style={[styles.error, { color: colors.error }]}>{formError}</Text> : null}

        <AuthButton
          title="Login"
          onPress={onLogin}
          loading={loginUserLoading}
          style={styles.submit}
          accent={accent}
        />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 15,
    position: 'relative',
    zIndex: 1,
  },
  watermarkWrap: {
    position: 'absolute',
    top: -34,
    left: -18,
    width: '125%',
    zIndex: 0,
  },
  watermark: {
    fontWeight: '800',
    includeFontPadding: false,
  },
  title: {
    fontSize: 30,
    lineHeight: 33,
    fontWeight: '800',
    letterSpacing: -0.6,
    zIndex: 1,
  },
  form: {
    gap: 0,
  },
  passwordField: {
    marginTop: 20,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 12,
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 17,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.6,
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
  },
  submit: {
    marginTop: 48,
    borderRadius: 999,
    minHeight: 62,
  },
});
