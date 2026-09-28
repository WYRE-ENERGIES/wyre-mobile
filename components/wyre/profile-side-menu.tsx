import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { WyreColors } from '@/constants/theme';
import { useAppTheme } from '@/context/theme-context';
import { getUserDisplayName, getUserInitials, getUserRoleLabel } from '@/lib/user-display';
import { useAppSelector } from '@/redux/hooks';

type ProfileSideMenuProps = {
  visible: boolean;
  onClose: () => void;
};

type MenuItem = {
  key: string;
  label: string;
  icon: 'person' | 'gearshape';
  href: '/(tabs)/profile' | '/settings';
};

const MENU_ITEMS: MenuItem[] = [
  { key: 'profile', label: 'View profile', icon: 'person', href: '/(tabs)/profile' },
  { key: 'settings', label: 'Settings', icon: 'gearshape', href: '/settings' },
];

const PANEL_WIDTH = 320;

export function ProfileSideMenu({ visible, onClose }: ProfileSideMenuProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();
  const userData = useAppSelector((state) => state.auth.userData);
  const slideX = useRef(new Animated.Value(PANEL_WIDTH)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const displayName = getUserDisplayName(userData);
  const initials = getUserInitials(userData);
  const roleLabel = getUserRoleLabel(userData);
  const email = typeof userData?.email === 'string' ? userData.email : null;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideX, {
          toValue: 0,
          useNativeDriver: true,
          damping: 22,
          stiffness: 220,
          mass: 0.9,
        }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(slideX, {
        toValue: PANEL_WIDTH,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, backdropOpacity, slideX]);

  const onNavigate = (href: MenuItem['href']) => {
    onClose();
    // Let the close animation start before navigating.
    setTimeout(() => router.push(href), 120);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity, backgroundColor: colors.overlay }]}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={onClose}
            accessibilityLabel="Close menu"
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.panel,
            {
              width: PANEL_WIDTH,
              paddingTop: insets.top + 16,
              paddingBottom: insets.bottom + 20,
              transform: [{ translateX: slideX }],
              backgroundColor: colors.surface,
            },
          ]}>
          <View style={styles.panelHeader}>
            <Text style={[styles.panelTitle, { color: colors.textOnCard }]}>Account</Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [
                styles.closeBtn,
                { backgroundColor: colors.surfaceMuted },
                pressed && styles.pressed,
              ]}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close side menu">
              <IconSymbol name="xmark" size={22} color={colors.textOnCard} />
            </Pressable>
          </View>

          <View style={[styles.userBlock, { borderBottomColor: colors.border }]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.userMeta}>
              <Text style={[styles.userName, { color: colors.textOnCard }]} numberOfLines={1}>
                {displayName}
              </Text>
              {email ? (
                <Text style={[styles.userEmail, { color: colors.textOnCardSecondary }]} numberOfLines={1}>
                  {email}
                </Text>
              ) : null}
              {roleLabel ? (
                <Text style={[styles.userRole, { color: colors.accent }]} numberOfLines={1}>
                  {roleLabel}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.menuList}>
            {MENU_ITEMS.map((item) => (
              <Pressable
                key={item.key}
                onPress={() => onNavigate(item.href)}
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && { backgroundColor: colors.surfaceMuted },
                ]}
                accessibilityRole="button"
                accessibilityLabel={item.label}>
                <View style={[styles.menuIconWrap, { backgroundColor: colors.accentMuted }]}>
                  <IconSymbol name={item.icon} size={22} color={colors.accent} />
                </View>
                <Text style={[styles.menuLabel, { color: colors.textOnCard }]}>{item.label}</Text>
                <IconSymbol name="chevron.right" size={22} color={colors.textOnCardSecondary} />
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  panel: {
    height: '100%',
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingBottom: 24,
    marginBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: WyreColors.purple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  userMeta: {
    flex: 1,
    gap: 2,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
  },
  userRole: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
  },
  menuList: {
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
