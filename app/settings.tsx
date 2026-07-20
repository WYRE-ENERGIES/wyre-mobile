import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthButton } from '@/components/auth/auth-button';
import { AppHeader } from '@/components/wyre/app-header';
import { WyreColors } from '@/constants/theme';
import { logUserOut } from '@/redux/actions/auth/auth.action';
import { useAppDispatch } from '@/redux/hooks';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();

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
        <Text style={styles.title}>Settings</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <Text style={styles.sectionBody}>
            Manage your Wyre solar dashboard preferences. More settings will be added here.
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
