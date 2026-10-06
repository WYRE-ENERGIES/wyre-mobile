import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/context/theme-context';

type ChartAxisLabelProps = {
  text: string;
};

/**
 * X-axis label for gifted-charts. The library sizes each label slot to the
 * point/bar spacing, which truncates text once a chart is fit to the card
 * width, so the label is drawn centred and allowed to overflow its slot.
 */
export function ChartAxisLabel({ text }: ChartAxisLabelProps) {
  const { colors } = useAppTheme();
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Text numberOfLines={1} style={[styles.text, { color: colors.textOnCardSecondary }]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: -30,
    right: -30,
    alignItems: 'center',
  },
  text: {
    fontSize: 10,
  },
});
