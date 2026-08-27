// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<SymbolViewProps['name'], ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'building.2.fill': 'business',
  'bell.fill': 'notifications',
  'bolt.fill': 'bolt',
  'sun.max.fill': 'wb-sunny',
  'square.grid.3x3': 'grid-view',
  'square.grid.3x3.fill': 'grid-view',
  'fuelpump': 'local-gas-station',
  'fuelpump.fill': 'local-gas-station',
  'chart.bar': 'bar-chart',
  'chart.bar.fill': 'bar-chart',
  'square.stack.3d.up.fill': 'layers',
  'plus': 'add',
  'gearshape': 'settings',
  'gearshape.fill': 'settings',
  'battery.25': 'battery-alert',
  'battery.100.bolt': 'battery-charging-full',
  'chevron.left': 'chevron-left',
  'envelope.open.fill': 'mark-email-read',
  'info.circle': 'info-outline',
  'info.circle.fill': 'info',
  'eye': 'visibility',
  'eye.slash': 'visibility-off',
  'xmark': 'close',
  'bell': 'notifications-none',
  'person': 'person-outline',
  'power': 'power-off',
  'cloud': 'cloud-queue',
  'cloud.fill': 'cloud',
  'gauge.with.dots.needle.33percent': 'speed',
  'wrench.and.screwdriver.fill': 'build',
  'powerplug.fill': 'electrical-services',
  'tag.fill': 'local-offer',
  'banknote.fill': 'payments',
  'calendar': 'calendar-today',
  'checkmark.square.fill': 'assignment-turned-in',
  'chart.pie.fill': 'pie-chart',
  'chart.line.downtrend.xyaxis': 'trending-down',
  'moon.fill': 'dark-mode',
  'lock.fill': 'lock',
  'slider.horizontal.3': 'tune',
  'person.crop.circle': 'account-circle',
  'scope': 'track-changes',
  'checkmark.circle.fill': 'check-circle',
  'exclamationmark.circle.fill': 'error',
  'chart.line.uptrend.xyaxis': 'analytics',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
