import { StyleSheet, Text, View } from 'react-native';

import { WyreColors } from '@/constants/theme';

type ChartAxisLabelProps = {
  text: string;
};

/**
 * X-axis label for gifted-charts. The library sizes each label slot to the
 * point/bar spacing, which truncates text once a chart is fit to the card
 * width, so the label is drawn centred and allowed to overflow its slot.
 */
export function ChartAxisLabel({ text }: ChartAxisLabelProps) {
  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Text numberOfLines={1} style={styles.text}>
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
    color: WyreColors.textSecondary,
  },
});
