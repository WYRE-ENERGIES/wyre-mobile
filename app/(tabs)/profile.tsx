import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { DashboardScreen } from '@/components/wyre/dashboard-screen';
import { NotificationBellButton } from '@/components/wyre/notification-bell-button';
import { ProfileDetails } from '@/components/wyre/profile-details';
import { useAppTheme } from '@/context/theme-context';

export default function ProfileTabScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  return (
    <DashboardScreen>
      <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <Text style={[styles.title, { color: colors.textOnPage }]}>Profile</Text>
        <View style={styles.actions}>
          <Pressable
            onPress={() => router.push('/settings')}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel="Open settings">
            <IconSymbol name="gearshape" size={27} color={colors.textOnPage} />
          </Pressable>
          <NotificationBellButton />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}>
        <ProfileDetails />
      </ScrollView>
    </DashboardScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  action: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.65,
  },
});
