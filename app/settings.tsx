import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Switch, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthTextField } from '@/components/auth/auth-text-field';
import { AccountScreen } from '@/components/wyre/account-screen';
import { ScreenCard } from '@/components/wyre/screen-card';
import { WyreColors } from '@/constants/theme';
import {
  STRONG_PASSWORD_HINT,
  validatePassword,
  validatePasswordConfirm,
  validateStrongPassword,
} from '@/lib/auth-validation';
import {
  loadNotificationPreference,
  openSystemNotificationSettings,
  updateNotificationPreference,
} from '@/lib/notification-prefs';
import { getUserDisplayName } from '@/lib/user-display';
import { changePasswordAction, logUserOut } from '@/redux/actions/auth/auth.action';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

type FieldErrors = {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
};

export default function SettingsScreen() {
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.auth.userData);
  const username =
    typeof userData?.username === 'string' && userData.username.trim()
      ? userData.username.trim()
      : '';
  const displayName = getUserDisplayName(userData);

  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(true);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    loadNotificationPreference()
      .then(setNotificationsEnabled)
      .finally(() => setNotificationsLoading(false));
  }, []);

  const onToggleNotifications = async (next: boolean) => {
    setNotificationsLoading(true);
    const result = await updateNotificationPreference(next);
    setNotificationsEnabled(result.enabled);
    setNotificationsLoading(false);

    if (result.permissionDenied) {
      Alert.alert(
        'Notifications disabled',
        'Enable notifications for Wyre in your device Settings to receive alerts.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open Settings', onPress: openSystemNotificationSettings },
        ],
      );
    }
  };

  const validatePasswordForm = (): boolean => {
    const next: FieldErrors = {
      oldPassword: validatePassword(oldPassword),
      newPassword: validateStrongPassword(newPassword),
      confirmPassword: validatePasswordConfirm(confirmPassword, newPassword),
    };
    setFieldErrors(next);
    return !next.oldPassword && !next.newPassword && !next.confirmPassword;
  };

  const onChangePassword = async () => {
    setFormError('');
    setFormSuccess('');
    if (!validatePasswordForm()) return;

    if (!username) {
      setFormError('Unable to identify your account. Please log in again.');
      return;
    }

    setPasswordLoading(true);
    const result = await changePasswordAction({
      username,
      password: oldPassword,
      new_password: newPassword,
    });
    setPasswordLoading(false);

    if (!result.fulfilled) {
      setFormError(result.message || 'Password change failed.');
      return;
    }

    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setFieldErrors({});
    setFormSuccess(result.message || 'Your password has been successfully updated.');
  };

  const onLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out of Wyre?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await dispatch(logUserOut());
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <AccountScreen title="Settings">
      <ScreenCard>
        <Text style={styles.sectionHeading}>Notifications</Text>
        <View style={styles.switchRow}>
          <View style={styles.switchCopy}>
            <Text style={styles.switchTitle}>Allow notifications</Text>
            <Text style={styles.switchBody}>
              Get solar alerts and system updates on this device.
            </Text>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={onToggleNotifications}
            disabled={notificationsLoading}
            trackColor={{ false: '#D1D5DB', true: 'rgba(92, 18, 167, 0.45)' }}
            thumbColor={notificationsEnabled ? WyreColors.purple : '#F9FAFB'}
            ios_backgroundColor="#D1D5DB"
          />
        </View>
      </ScreenCard>

      <ScreenCard title="Password">
        <View style={styles.form}>
          <AuthTextField
            label="Old Password"
            placeholder="Enter current password"
            value={oldPassword}
            onChangeText={(text) => {
              setOldPassword(text);
              setFormError('');
              setFormSuccess('');
            }}
            error={fieldErrors.oldPassword}
            isPassword
            textContentType="password"
            autoComplete="password"
            returnKeyType="next"
          />

          <AuthTextField
            label="New Password"
            placeholder="Enter new password"
            value={newPassword}
            onChangeText={(text) => {
              setNewPassword(text);
              setFormError('');
              setFormSuccess('');
              if (fieldErrors.newPassword) {
                setFieldErrors((prev) => ({
                  ...prev,
                  newPassword: validateStrongPassword(text),
                }));
              }
            }}
            error={fieldErrors.newPassword}
            isPassword
            textContentType="newPassword"
            autoComplete="password-new"
            returnKeyType="next"
          />

          <AuthTextField
            label="Re-enter New Password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setFormError('');
              setFormSuccess('');
            }}
            error={fieldErrors.confirmPassword}
            isPassword
            textContentType="newPassword"
            autoComplete="password-new"
            returnKeyType="go"
            onSubmitEditing={onChangePassword}
          />

          <View style={styles.hintRow}>
            <MaterialIcons name="info" size={18} color={WyreColors.purple} />
            <Text style={styles.hintText}>{STRONG_PASSWORD_HINT}</Text>
          </View>

          {formError ? <Text style={styles.error}>{formError}</Text> : null}
          {formSuccess ? <Text style={styles.success}>{formSuccess}</Text> : null}

          <AuthButton
            title="Change Password"
            onPress={onChangePassword}
            loading={passwordLoading}
          />
        </View>
      </ScreenCard>

      <ScreenCard>
        <Text style={styles.sectionHeading}>Account</Text>
        <Text style={styles.accountBody}>
          Signed in as {displayName}. Signing out clears your session on this device.
        </Text>
        <AuthButton title="Log out" onPress={onLogout} variant="danger" style={styles.logoutBtn} />
      </ScreenCard>
    </AccountScreen>
  );
}

const styles = StyleSheet.create({
  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: WyreColors.textPrimary,
    marginBottom: 14,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  switchCopy: {
    flex: 1,
    gap: 4,
  },
  switchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: WyreColors.textPrimary,
  },
  switchBody: {
    fontSize: 13,
    lineHeight: 18,
    color: WyreColors.textSecondary,
  },
  form: {
    gap: 14,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    paddingRight: 4,
  },
  hintText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: WyreColors.textSecondary,
  },
  error: {
    fontSize: 14,
    color: WyreColors.error,
    textAlign: 'center',
  },
  success: {
    fontSize: 14,
    color: WyreColors.success,
    textAlign: 'center',
  },
  accountBody: {
    fontSize: 14,
    lineHeight: 20,
    color: WyreColors.textSecondary,
    marginBottom: 16,
  },
  logoutBtn: {
    marginTop: 4,
  },
});
