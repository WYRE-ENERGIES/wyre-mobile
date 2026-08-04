import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SCREEN_PADDING_H } from '@/constants/layout';
import { WyreColors } from '@/constants/theme';
import { getUserDisplayName, getUserInitials, getUserRoleLabel } from '@/lib/user-display';
import { useAppSelector } from '@/redux/hooks';

type ProfileSideMenuProps = {
  visible: boolean;
  onClose: () => void;
};

type MenuItem = {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  href: '/profile' | '/scorecard' | '/cost-tracker' | '/settings';
};

/** Primary destinations — new pages go here, above Settings. */
const PRIMARY_MENU_ITEMS: MenuItem[] = [
  { key: 'profile', label: 'View profile', icon: 'person-outline', href: '/profile' },
  { key: 'scorecard', label: 'Scorecard', icon: 'insights', href: '/scorecard' },
  { key: 'cost-tracker', label: 'Cost Tracker', icon: 'payments', href: '/cost-tracker' },
];

/** Pinned to the bottom of the side menu. */
const FOOTER_MENU_ITEMS: MenuItem[] = [
  { key: 'settings', label: 'Settings', icon: 'settings', href: '/settings' },
];

const PANEL_WIDTH = 320;

export function ProfileSideMenu({ visible, onClose }: ProfileSideMenuProps) {
  const insets = useSafeAreaInsets();
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
    setTimeout(() => router.push(href), 120);
  };

  const renderMenuItem = (item: MenuItem) => (
    <Pressable
      key={item.key}
      onPress={() => onNavigate(item.href)}
      style={({ pressed }) => [styles.menuItem, pressed && styles.menuItemPressed]}
      accessibilityRole="button"
      accessibilityLabel={item.label}>
      <View style={styles.menuIconWrap}>
        <MaterialIcons name={item.icon} size={22} color={WyreColors.purple} />
      </View>
      <Text style={styles.menuLabel}>{item.label}</Text>
      <MaterialIcons name="chevron-right" size={22} color={WyreColors.textSecondary} />
    </Pressable>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent>
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
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
            },
          ]}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Account</Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Close side menu">
              <MaterialIcons name="close" size={22} color={WyreColors.textPrimary} />
            </Pressable>
          </View>

          <View style={styles.userBlock}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.userMeta}>
              <Text style={styles.userName} numberOfLines={1}>
                {displayName}
              </Text>
              {email ? (
                <Text style={styles.userEmail} numberOfLines={1}>
                  {email}
                </Text>
              ) : null}
              {roleLabel ? (
                <Text style={styles.userRole} numberOfLines={1}>
                  {roleLabel}
                </Text>
              ) : null}
            </View>
          </View>

          <View style={styles.menuList}>{PRIMARY_MENU_ITEMS.map(renderMenuItem)}</View>

          <View style={styles.menuSpacer} />

          <View style={styles.footerList}>{FOOTER_MENU_ITEMS.map(renderMenuItem)}</View>
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
    backgroundColor: 'rgba(17, 24, 39, 0.4)',
  },
  panel: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: SCREEN_PADDING_H,
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
    color: WyreColors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WyreColors.pageBg,
  },
  userBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingBottom: 24,
    marginBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: WyreColors.border,
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
    color: WyreColors.textPrimary,
  },
  userEmail: {
    fontSize: 13,
    color: WyreColors.textSecondary,
  },
  userRole: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '600',
    color: WyreColors.purple,
  },
  menuList: {
    gap: 4,
  },
  menuSpacer: {
    flex: 1,
  },
  footerList: {
    gap: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: WyreColors.border,
    paddingTop: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  menuItemPressed: {
    backgroundColor: WyreColors.pageBg,
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(92, 18, 167, 0.08)',
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: WyreColors.textPrimary,
  },
  pressed: {
    opacity: 0.7,
  },
});
