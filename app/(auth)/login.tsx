import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthScreen } from '@/components/auth/auth-screen';
import { AuthTextField } from '@/components/auth/auth-text-field';
import { SplashLogoHandoff } from '@/components/auth/splash-logo-handoff';
import { WyreColors } from '@/constants/theme';
import { validatePassword, validateUsername } from '@/lib/auth-validation';
import { loginAUser } from '@/redux/actions/auth/auth.action';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

type FieldErrors = {
  username?: string;
  password?: string;
};

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const loginUserLoading = useAppSelector((state) => state.auth.loginUserLoading);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [hasPlayedHandoff, setHasPlayedHandoff] = useState(false);
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
    <SplashLogoHandoff skip={hasPlayedHandoff} onComplete={() => setHasPlayedHandoff(true)}>
      {({ hideLogo }) => (
        <AuthScreen hideLogo={hideLogo}>
          <View style={styles.header}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to your Wyre solar dashboard</Text>
          </View>

          <View style={styles.form}>
            <AuthTextField
              label="Username"
              placeholder="Enter your username"
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

            <AuthTextField
              label="Password"
              placeholder="Enter your password"
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

            <Pressable
              onPress={() => router.push('/(auth)/forgot-password')}
              style={({ pressed }) => [styles.forgotBtn, pressed && styles.pressed]}
              hitSlop={8}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            {formError ? <Text style={styles.error}>{formError}</Text> : null}

            <AuthButton
              title="Log in"
              onPress={onLogin}
              loading={loginUserLoading}
              style={styles.submit}
            />
          </View>
        </AuthScreen>
      )}
    </SplashLogoHandoff>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: WyreColors.textPrimary,
    letterSpacing: -0.6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: WyreColors.textSecondary,
    textAlign: 'center',
  },
  form: {
    gap: 14,
  },
  forgotBtn: {
    alignSelf: 'center',
    paddingVertical: 4,
  },
  forgotText: {
    fontSize: 15,
    fontWeight: '500',
    color: WyreColors.purple,
  },
  pressed: {
    opacity: 0.6,
  },
  error: {
    fontSize: 14,
    color: WyreColors.error,
    textAlign: 'center',
  },
  submit: {
    marginTop: 6,
  },
});
