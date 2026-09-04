import { StyleSheet, Text, View } from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { UserAvatar } from '@/components/wyre/user-avatar';
import { useAppTheme } from '@/context/theme-context';
import {
  getAccountFields,
  getOrganisationFields,
  getOrganisationName,
  getUserDisplayName,
  type ProfileField,
} from '@/lib/user-display';
import { useAppSelector } from '@/redux/hooks';

function ProfileSection({
  title,
  icon,
  fields,
}: {
  title: string;
  icon: 'person' | 'building.2.fill';
  fields: ProfileField[];
}) {
  const { colors } = useAppTheme();

  if (fields.length === 0) return null;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: colors.accentMuted }]}>
          <IconSymbol name={icon} size={18} color={colors.accent} />
        </View>
        <Text style={[styles.sectionTitle, { color: colors.textOnCard }]}>{title}</Text>
      </View>
      <View style={styles.fields}>
        {fields.map((field) => {
          const fullWidth = field.label === 'Email';
          return (
            <View
              key={field.label}
              style={[styles.field, fullWidth && styles.fieldFull]}>
              <Text style={[styles.fieldLabel, { color: colors.textOnCardSecondary }]}>
                {field.label}
              </Text>
              <Text
                numberOfLines={fullWidth ? 2 : 1}
                style={[styles.fieldValue, { color: colors.textOnCard }]}>
                {field.value}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function ProfileDetails() {
  const userData = useAppSelector((state) => state.auth.userData);
  const { colors } = useAppTheme();
  const displayName = getUserDisplayName(userData);
  const organisation = getOrganisationName(userData);
  const accountFields = getAccountFields(userData);
  const organisationFields = getOrganisationFields(userData).filter(
    (field) => field.label !== 'Client' || field.value !== organisation,
  );
  const role = accountFields.find((field) => field.label === 'Role')?.value;
  const displayAccountFields = accountFields.filter((field) => field.label !== 'Role');

  return (
    <View style={styles.container}>
      <View style={[styles.identityCard, { backgroundColor: colors.surface }]}>
        <UserAvatar userData={userData} size={60} bordered={false} />
        <View style={styles.identityCopy}>
          <Text numberOfLines={1} style={[styles.name, { color: colors.textOnCard }]}>
            {displayName}
          </Text>
          {organisation ? (
            <Text
              numberOfLines={1}
              style={[styles.subtitle, { color: colors.textOnCardSecondary }]}>
              {organisation}
            </Text>
          ) : null}
          {role ? (
            <View style={[styles.roleBadge, { backgroundColor: colors.accentMuted }]}>
              <Text style={[styles.roleText, { color: colors.accent }]}>{role}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <ProfileSection title="Account" icon="person" fields={displayAccountFields} />
      <ProfileSection
        title="Organisation"
        icon="building.2.fill"
        fields={organisationFields}
      />

      {accountFields.length === 0 && organisationFields.length === 0 ? (
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.empty, { color: colors.textOnCardSecondary }]}>
            No profile details are available on this account yet.
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  identityCard: {
    borderRadius: 22,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  identityCopy: {
    flex: 1,
    alignItems: 'flex-start',
    gap: 3,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
  },
  roleBadge: {
    marginTop: 5,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: 22,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  fields: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: 12,
    rowGap: 15,
  },
  field: {
    width: '47%',
    gap: 3,
  },
  fieldFull: {
    width: '100%',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',
  },
  empty: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
