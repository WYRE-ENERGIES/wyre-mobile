import { AccountScreen } from '@/components/wyre/account-screen';
import { WyreColors } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

export function AddDieselEntryContent() {
  return (
    <AccountScreen title="Add Diesel Entry">
      <Text style={styles.lead}>
        Log daily diesel consumption and generator runtime — matching the web Cost Tracker
        &quot;Add Diesel Entry&quot; flow.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Daily entry</Text>
        <Text style={styles.cardBody}>
          Date, quantity (L), hours of use, and per-generator energy where applicable.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Monthly entry</Text>
        <Text style={styles.cardBody}>Bulk monthly diesel usage for your branch.</Text>
      </View>

      <Text style={styles.note}>
        Mobile diesel entry forms are coming soon. Use the Wyre web dashboard to add or edit
        entries in the meantime.
      </Text>
    </AccountScreen>
  );
}

const styles = StyleSheet.create({
  lead: {
    fontSize: 14,
    lineHeight: 20,
    color: WyreColors.textSecondary,
    marginTop: -8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: WyreColors.border,
    gap: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: WyreColors.textPrimary,
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 18,
    color: WyreColors.textSecondary,
  },
  note: {
    fontSize: 13,
    lineHeight: 18,
    color: WyreColors.textSecondary,
    fontStyle: 'italic',
  },
});
