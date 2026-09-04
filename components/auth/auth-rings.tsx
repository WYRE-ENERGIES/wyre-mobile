import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { useAppTheme } from '@/context/theme-context';

export function AuthRings() {
  const { isDark } = useAppTheme();
  const { width } = useWindowDimensions();

  if (!isDark) return null;

  const size = width * 1.55;
  const cx = size / 2;
  const cy = size * 0.42;
  const rings = [0.22, 0.34, 0.46, 0.58, 0.7];

  return (
    <View pointerEvents="none" style={[styles.wrap, { width: size, height: size, left: (width - size) / 2 }]}>
      <Svg width={size} height={size}>
        {rings.map((scale) => (
          <Circle
            key={scale}
            cx={cx}
            cy={cy}
            r={(size / 2) * scale}
            stroke="rgba(196, 160, 255, 0.08)"
            strokeWidth={1}
            fill="none"
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: -90,
  },
});
