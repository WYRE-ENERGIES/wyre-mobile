import { router } from 'expo-router';
import { Pressable, StyleSheet, Text } from 'react-native';

import { WyreColors } from '@/constants/theme';
import { getUserInitials } from '@/lib/user-display';
import { useAppSelector } from '@/redux/hooks';

type UserAvatarButtonProps = {
  size?: number;
};

export function UserAvatarButton({ size = 40 }: UserAvatarButtonProps) {
  const userData = useAppSelector((state) => state.auth.userData);
  const initials = getUserInitials(userData);

  return (
    <Pressable
      onPress={() => router.push('/profile')}
      style={({ pressed }) => [
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
        pressed && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel="Open profile and settings">
      <Text style={[styles.initials, { fontSize: size * 0.36 }]}>{initials}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WyreColors.purple,
  },
  initials: {
    color: '#FFFFFF',
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  pressed: {
    opacity: 0.85,
  },
});
