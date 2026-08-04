import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { WyreColors } from '@/constants/theme';

type Action = {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  href: '/add-bills' | '/add-diesel-entry';
};

const ACTIONS: Action[] = [
  { key: 'bills', label: 'Add Bills', icon: 'receipt-long', href: '/add-bills' },
  { key: 'diesel', label: 'Add Diesel Entry', icon: 'local-gas-station', href: '/add-diesel-entry' },
];

export function CostTrackerActions() {
  return (
    <View style={styles.wrapper}>
      {ACTIONS.map((action) => (
        <Pressable
          key={action.key}
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={() => router.push(action.href)}
          accessibilityRole="button"
          accessibilityLabel={action.label}>
          <MaterialIcons name={action.icon} size={18} color={WyreColors.purple} />
          <Text style={styles.buttonText}>{action.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WyreColors.border,
  },
  buttonPressed: {
    opacity: 0.75,
    backgroundColor: WyreColors.pageBg,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: WyreColors.purple,
  },
});
