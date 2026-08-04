import { StyleSheet, Text, View } from 'react-native';

import { NoSolarAccess } from '@/components/solar/no-solar-access';
import { SolarOverviewContent } from '@/components/solar/solar-overview-content';
import { TabScreenLayout } from '@/components/wyre/tab-screen-layout';
import { WyreColors } from '@/constants/theme';
import { getBranchId, isSolarCustomer } from '@/lib/auth-user';
import { useAppSelector } from '@/redux/hooks';

export default function HomeScreen() {
  const userData = useAppSelector((state) => state.auth.userData);

  if (!isSolarCustomer(userData)) {
    return (
      <TabScreenLayout title="Home">
        <NoSolarAccess />
      </TabScreenLayout>
    );
  }

  const branchId = getBranchId(userData);
  if (!branchId) {
    return (
      <TabScreenLayout title="Solar Overview">
        <View style={styles.centered}>
          <Text style={styles.errorTitle}>Branch not found</Text>
          <Text style={styles.errorMessage}>
            Your account does not have a site linked yet. Please contact Wyre support for
            assistance.
          </Text>
        </View>
      </TabScreenLayout>
    );
  }

  return <SolarOverviewContent branchId={branchId} />;
}

const styles = StyleSheet.create({
  centered: {
    paddingTop: 16,
    gap: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: WyreColors.textPrimary,
  },
  errorMessage: {
    fontSize: 14,
    lineHeight: 20,
    color: WyreColors.textSecondary,
  },
});
