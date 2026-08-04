import { AccountScreen } from '@/components/wyre/account-screen';
import { WyreColors } from '@/constants/theme';
import { StyleSheet, Text, View } from 'react-native';

export function AddBillsContent() {
  return (
    <AccountScreen title="Add Bills">
      <Text style={styles.lead}>
        Record diesel purchases and utility payments for your site — matching the web Cost
        Tracker &quot;Add Bills&quot; flow.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Diesel purchase</Text>
        <Text style={styles.cardBody}>Date, quantity (L), and price per litre.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Utility payment</Text>
        <Text style={styles.cardBody}>
          Pre-paid or post-paid kWh, tariff, amount, and VAT-inclusive total.
        </Text>
      </View>

      <Text style={styles.note}>
        Mobile bill entry forms are coming soon. Use the Wyre web dashboard to add or edit
        bills in the meantime.
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
