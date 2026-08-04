import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionCard } from '@/components/solar/section-card';
import { WyreColors } from '@/constants/theme';

const SUPPORT_EMAIL = 'support@wyreng.com';
const SUPPORT_WEBSITE = 'https://wyreng.com';

export function NoSolarAccess() {
  const openEmail = () => {
    void Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Solar%20System%20Enquiry`);
  };

  const openWebsite = () => {
    void Linking.openURL(SUPPORT_WEBSITE);
  };

  return (
    <View style={styles.wrapper}>
      <SectionCard title="Solar monitoring unavailable">
        <Text style={styles.message}>
          Your account is not linked to a Wyre solar installation yet. Solar monitoring is
          available exclusively for customers with an active Wyre solar system.
        </Text>
        <Text style={styles.hint}>
          Interested in going solar or need help with your account? Our team can walk you through
          options and next steps.
        </Text>
      </SectionCard>

      <Pressable style={styles.primaryButton} onPress={openEmail}>
        <Text style={styles.primaryButtonText}>Contact Wyre</Text>
      </Pressable>

      <Pressable style={styles.secondaryButton} onPress={openWebsite}>
        <Text style={styles.secondaryButtonText}>Visit wyreng.com</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 16,
    paddingTop: 8,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    color: WyreColors.textPrimary,
  },
  hint: {
    fontSize: 14,
    lineHeight: 20,
    color: WyreColors.textSecondary,
  },
  primaryButton: {
    backgroundColor: WyreColors.purple,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: WyreColors.border,
    backgroundColor: WyreColors.surface,
  },
  secondaryButtonText: {
    color: WyreColors.purple,
    fontSize: 15,
    fontWeight: '600',
  },
});
