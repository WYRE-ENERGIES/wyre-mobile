import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/auth-button';
import { AppHeader } from '@/components/wyre/app-header';
import { WyreColors } from '@/constants/theme';
import { getUserDisplayName, getUserInitials, getUserRoleLabel } from '@/lib/user-display';
import { logUserOut } from '@/redux/actions/auth/auth.action';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const userData = useAppSelector((state) => state.auth.userData);

  const displayName = getUserDisplayName(userData);
  const initials = getUserInitials(userData);
  const roleLabel = getUserRoleLabel(userData);
  const email = typeof userData?.email === 'string' ? userData.email : null;

  const onLogout = async () => {
    await dispatch(logUserOut());
    router.replace('/(auth)/login');
  };

  return (
    <View style={styles.root}>
      <AppHeader
        rightAction={
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <MaterialIcons name="close" size={22} color={WyreColors.textPrimary} />
          </Pressable>
        }
      />

      <View style={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <Text style={styles.title}>Profile & Settings</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          {email ? <Text style={styles.email}>{email}</Text> : null}
          {roleLabel ? <Text style={styles.role}>{roleLabel}</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Text style={styles.sectionBody}>
            Manage your Wyre solar dashboard account. More settings will be added here.
          </Text>
        </View>

        <AuthButton title="Log out" onPress={onLogout} variant="danger" style={styles.logoutBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: WyreColors.pageBg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: WyreColors.textPrimary,
    marginBottom: 24,
  },
  profileCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: WyreColors.border,
    marginBottom: 24,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: WyreColors.purple,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: WyreColors.textPrimary,
    textAlign: 'center',
  },
  email: {
    marginTop: 6,
    fontSize: 14,
    color: WyreColors.textSecondary,
    textAlign: 'center',
  },
  role: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: '600',
    color: WyreColors.purple,
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: WyreColors.textPrimary,
  },
  sectionBody: {
    fontSize: 14,
    lineHeight: 20,
    color: WyreColors.textSecondary,
  },
  logoutBtn: {
    marginTop: 'auto',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WyreColors.pageBg,
  },
  pressed: {
    opacity: 0.7,
  },
});
