import { StyleSheet, Text, View } from 'react-native';

import { AccountScreen } from '@/components/wyre/account-screen';
import { DetailField, DetailSection, ScreenCard } from '@/components/wyre/screen-card';
import { WyreColors } from '@/constants/theme';
import {
  getAccountFields,
  getOrganisationFields,
  getOrganisationName,
  getUserDisplayName,
  getUserInitials,
} from '@/lib/user-display';
import { useAppSelector } from '@/redux/hooks';

export default function ProfileScreen() {
  const userData = useAppSelector((state) => state.auth.userData);

  const displayName = getUserDisplayName(userData);
  const initials = getUserInitials(userData);
  const organisation = getOrganisationName(userData);
  const accountFields = getAccountFields(userData);
  const organisationFields = getOrganisationFields(userData);

  return (
    <AccountScreen title="Personal Data">
      <ScreenCard>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.name}>{displayName}</Text>
          {organisation ? <Text style={styles.subtitle}>{organisation}</Text> : null}
        </View>

        {accountFields.length > 0 ? (
          <DetailSection title="Account">
            {accountFields.map((field) => (
              <DetailField key={field.label} label={field.label} value={field.value} />
            ))}
          </DetailSection>
        ) : null}

        {organisationFields.length > 0 ? (
          <DetailSection title="Organisation">
            {organisationFields.map((field) => (
              <DetailField key={field.label} label={field.label} value={field.value} />
            ))}
          </DetailSection>
        ) : null}

        {accountFields.length === 0 && organisationFields.length === 0 ? (
          <Text style={styles.empty}>
            No profile details are available on this account yet.
          </Text>
        ) : null}
      </ScreenCard>
    </AccountScreen>
  );
}

const styles = StyleSheet.create({
  identity: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  avatar: {
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
    fontSize: 22,
    fontWeight: '700',
    color: WyreColors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 15,
    color: WyreColors.textSecondary,
    textAlign: 'center',
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    color: WyreColors.textSecondary,
    textAlign: 'center',
  },
});
