import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { NotificationBellButton } from '@/components/wyre/notification-bell-button';
import { useAppTheme } from '@/context/theme-context';

type DieselHeaderProps = {
  monthLabel: string;
  year: number;
  showTracker?: boolean;
  onOpenTracker?: () => void;
};

export function DieselHeader({
  monthLabel,
  year,
  showTracker = false,
  onOpenTracker,
}: DieselHeaderProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  return (
    <View style={[styles.row, { paddingTop: insets.top + 8 }]}>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.textOnPage }]}>Diesel Overview</Text>
          <View style={styles.actions}>
            {showTracker && onOpenTracker ? (
              <Pressable
                accessibilityLabel="Open Tracker"
                hitSlop={8}
                onPress={onOpenTracker}
                style={({ pressed }) => [styles.trackerButton, pressed && styles.pressed]}>
                <IconSymbol
                  name="chart.line.uptrend.xyaxis"
                  size={27}
                  color={colors.textOnPage}
                />
              </Pressable>
            ) : null}
            <NotificationBellButton />
          </View>
        </View>
        <Text style={[styles.subtitle, { color: colors.textOnPageMuted }]}>
          Generator Fuel Usage & Efficiency for{' '}
          <Text style={[styles.emphasis, { color: colors.textOnPage }]}>
            {monthLabel} {year}
          </Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  copy: {
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  title: {
    flex: 1,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  emphasis: {
    fontWeight: '700',
  },
  trackerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
});
