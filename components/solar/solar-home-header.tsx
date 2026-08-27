import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NotificationBellButton } from '@/components/wyre/notification-bell-button';
import { UserAvatar } from '@/components/wyre/user-avatar';
import { useAppTheme } from '@/context/theme-context';
import { greetingForHour } from '@/lib/format';
import { useAppSelector } from '@/redux/hooks';

type SolarHomeHeaderProps = {
  siteName: string;
};

export function SolarHomeHeader({ siteName }: SolarHomeHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const userData = useAppSelector((state) => state.auth.userData);

  return (
    <View style={[styles.row, { paddingTop: insets.top + 8 }]}>
      <Pressable
        onPress={() => router.push('/(tabs)/profile')}
        style={({ pressed }) => pressed && styles.pressed}
        accessibilityRole="button"
        accessibilityLabel="Open profile">
        <UserAvatar userData={userData} size={48} bordered={false} />
      </Pressable>
      <View style={styles.copy}>
        <Text style={[styles.greeting, { color: colors.textOnPageMuted }]}>
          {greetingForHour()} 👋
        </Text>
        <Text style={[styles.site, { color: colors.textOnPage }]} numberOfLines={1}>
          {siteName}
        </Text>
      </View>
      <NotificationBellButton softBackground />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 10,
    gap: 12,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  greeting: {
    fontSize: 15,
    fontWeight: '500',
  },
  site: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  pressed: {
    opacity: 0.72,
  },
});
