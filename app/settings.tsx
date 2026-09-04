import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { AuthButton } from '@/components/auth/auth-button';
import { AuthTextField } from '@/components/auth/auth-text-field';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AccountScreen } from '@/components/wyre/account-screen';
import { useAppTheme } from '@/context/theme-context';
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
  const { colors, isDark, setScheme } = useAppTheme();
  const userData = useAppSelector((state) => state.auth.userData);
  const username =
    typeof userData?.username === 'string' && userData.username.trim()
      ? userData.username.trim()
      : '';
  const displayName = getUserDisplayName(userData);
  const email = typeof userData?.email === 'string' ? userData.email : '';
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
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
        'Allow notifications in device Settings to receive energy alerts.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Open Settings', onPress: openSystemNotificationSettings },
        ],
      );
    }
  };

  const onChangePassword = async () => {
    setFormError('');
    setFormSuccess('');
    const nextErrors = {
      oldPassword: validatePassword(oldPassword),
      newPassword: validateStrongPassword(newPassword),
      confirmPassword: validatePasswordConfirm(confirmPassword, newPassword),
    };
    setFieldErrors(nextErrors);
    if (nextErrors.oldPassword || nextErrors.newPassword || nextErrors.confirmPassword) return;
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
    setFormSuccess(result.message || 'Password updated successfully.');
  };

  const onLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out of Wyre?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await dispatch(logUserOut());
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  };

  return (
    <AccountScreen title="Settings" showWordmark={false}>
      <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.profileCopy}>
          <Text style={[styles.profileName, { color: colors.textOnCard }]}>{displayName}</Text>
          <Text numberOfLines={1} style={[styles.profileEmail, { color: colors.textOnCardSecondary }]}>
            {email || username}
          </Text>
        </View>
        <Pressable onPress={() => router.push('/(tabs)/profile')} hitSlop={8}>
          <IconSymbol name="chevron.right" size={22} color={colors.textOnCardSecondary} />
        </Pressable>
      </View>

      <SettingsGroup title="Preferences">
        <ToggleRow
          icon="moon.fill"
          title="Dark mode"
          body="Use the darker app appearance"
          value={isDark}
          onValueChange={(next) => setScheme(next ? 'dark' : 'light')}
        />
        <Divider />
        <ToggleRow
          icon="bell.fill"
          title="Push notifications"
          body="Energy alerts and system updates"
          value={notificationsEnabled}
          disabled={notificationsLoading}
          onValueChange={onToggleNotifications}
        />
      </SettingsGroup>

      <SettingsGroup title="Energy & alerts">
        <LinkRow
          icon="scope"
          title="Alert targets"
          body="Battery, capacity, and delivery rules"
          onPress={() => router.push('/(tabs)/target')}
        />
        <Divider />
        <LinkRow
          icon="slider.horizontal.3"
          title="Device notification settings"
          body="Sound, banners, and permissions"
          onPress={openSystemNotificationSettings}
        />
      </SettingsGroup>

      <SettingsGroup title="Security">
        <LinkRow
          icon="lock.fill"
          title="Change password"
          body="Update your account password"
          expanded={showPasswordForm}
          onPress={() => {
            setShowPasswordForm((value) => !value);
            setFormError('');
            setFormSuccess('');
          }}
        />
        {showPasswordForm ? (
          <View style={styles.passwordForm}>
            <AuthTextField
              label="Current password"
              placeholder="Enter current password"
              value={oldPassword}
              onChangeText={setOldPassword}
              error={fieldErrors.oldPassword}
              isPassword
              textContentType="password"
            />
            <AuthTextField
              label="New password"
              placeholder="Enter new password"
              value={newPassword}
              onChangeText={setNewPassword}
              error={fieldErrors.newPassword}
              isPassword
              textContentType="newPassword"
            />
            <AuthTextField
              label="Confirm password"
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={fieldErrors.confirmPassword}
              isPassword
              textContentType="newPassword"
              onSubmitEditing={onChangePassword}
            />
            <Text style={[styles.passwordHint, { color: colors.textOnCardSecondary }]}>
              {STRONG_PASSWORD_HINT}
            </Text>
            {formError ? <Text style={[styles.feedback, { color: colors.error }]}>{formError}</Text> : null}
            {formSuccess ? (
              <Text style={[styles.feedback, { color: colors.success }]}>{formSuccess}</Text>
            ) : null}
            <AuthButton
              title="Update password"
              onPress={onChangePassword}
              loading={passwordLoading}
            />
          </View>
        ) : null}
      </SettingsGroup>

      <Pressable
        onPress={onLogout}
        style={({ pressed }) => [
          styles.logout,
          { backgroundColor: colors.surface },
          pressed && styles.pressed,
        ]}>
        <IconSymbol name="power" size={20} color={colors.error} />
        <View style={styles.logoutCopy}>
          <Text style={[styles.logoutTitle, { color: colors.error }]}>Log out</Text>
          <Text style={[styles.logoutBody, { color: colors.textOnCardSecondary }]}>
            End this session on your device
          </Text>
        </View>
      </Pressable>
    </AccountScreen>
  );
}

type IconName =
  | 'moon.fill'
  | 'bell.fill'
  | 'scope'
  | 'slider.horizontal.3'
  | 'lock.fill';

function SettingsGroup({ title, children }: { title: string; children: ReactNode }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.groupWrap}>
      <Text style={[styles.groupTitle, { color: colors.textOnPageMuted }]}>{title}</Text>
      <View style={[styles.group, { backgroundColor: colors.surface }]}>{children}</View>
    </View>
  );
}

function ToggleRow({
  icon,
  title,
  body,
  value,
  disabled,
  onValueChange,
}: {
  icon: IconName;
  title: string;
  body: string;
  value: boolean;
  disabled?: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.row}>
      <RowIcon name={icon} />
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, { color: colors.textOnCard }]}>{title}</Text>
        <Text style={[styles.rowBody, { color: colors.textOnCardSecondary }]}>{body}</Text>
      </View>
      <Switch
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{ false: colors.surfaceMuted, true: colors.accentMuted }}
        thumbColor={value ? colors.accent : '#F3F4F6'}
        ios_backgroundColor={colors.surfaceMuted}
      />
    </View>
  );
}

function LinkRow({
  icon,
  title,
  body,
  expanded,
  onPress,
}: {
  icon: IconName;
  title: string;
  body: string;
  expanded?: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <RowIcon name={icon} />
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, { color: colors.textOnCard }]}>{title}</Text>
        <Text style={[styles.rowBody, { color: colors.textOnCardSecondary }]}>{body}</Text>
      </View>
      <IconSymbol
        name={expanded ? 'chevron.left' : 'chevron.right'}
        size={20}
        color={colors.textOnCardSecondary}
        style={expanded ? styles.chevronUp : undefined}
      />
    </Pressable>
  );
}

function RowIcon({ name }: { name: IconName }) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.rowIcon, { backgroundColor: colors.accentMuted }]}>
      <IconSymbol name={name} size={18} color={colors.accent} />
    </View>
  );
}

function Divider() {
  const { colors } = useAppTheme();
  return <View style={[styles.divider, { backgroundColor: colors.border }]} />;
}

const styles = StyleSheet.create({
  profileCard: {
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: { width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  profileCopy: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '800' },
  profileEmail: { marginTop: 3, fontSize: 12 },
  groupWrap: { gap: 7 },
  groupTitle: { paddingLeft: 4, fontSize: 11, fontWeight: '800', letterSpacing: 0.7, textTransform: 'uppercase' },
  group: { borderRadius: 20, overflow: 'hidden' },
  row: { minHeight: 72, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowCopy: { flex: 1, gap: 3 },
  rowTitle: { fontSize: 14, fontWeight: '700' },
  rowBody: { fontSize: 11, lineHeight: 15 },
  divider: { height: StyleSheet.hairlineWidth, marginLeft: 62 },
  passwordForm: { paddingHorizontal: 14, paddingBottom: 16, gap: 12 },
  passwordHint: { fontSize: 11, lineHeight: 16 },
  feedback: { fontSize: 12, textAlign: 'center' },
  logout: { borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 13 },
  logoutCopy: { flex: 1 },
  logoutTitle: { fontSize: 14, fontWeight: '800' },
  logoutBody: { marginTop: 3, fontSize: 11 },
  pressed: { opacity: 0.72 },
  chevronUp: { transform: [{ rotate: '90deg' }] },
});
