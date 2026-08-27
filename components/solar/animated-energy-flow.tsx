import { useEffect } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/context/theme-context';
import { formatKw, formatKwp } from '@/lib/format';
import type { SiteNode, SolarSiteStatus } from '@/lib/solar-types';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type FlowDirection = 'forward' | 'reverse' | 'idle';
type FlowIcon =
  | 'battery.100.bolt'
  | 'powerplug.fill'
  | 'house.fill'
  | 'fuelpump.fill'
  | 'sun.max.fill';

type NodeLayout = {
  key: string;
  x: number;
  y: number;
  label: string;
  value: string;
  detail: string;
  color: string;
  icon: FlowIcon;
  direction: FlowDirection;
};

function nodeDirection(
  node: SiteNode | undefined,
  fallback: FlowDirection,
  disabled = false,
): FlowDirection {
  if (disabled || node?.direction === 'IDLE') return 'idle';
  if (node?.direction === 'IN') return 'forward';
  if (node?.direction === 'OUT') return 'reverse';
  return fallback;
}

function FlowPath({
  path,
  color,
  direction,
}: {
  path: string;
  color: string;
  direction: FlowDirection;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    if (direction !== 'idle') {
      progress.value = withRepeat(
        withTiming(1, { duration: 1450, easing: Easing.linear }),
        -1,
        false,
      );
    }
  }, [direction, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: (direction === 'reverse' ? 1 : -1) * progress.value * 44,
  }));

  return (
    <>
      <Path
        d={path}
        fill="none"
        stroke="rgba(148,163,184,0.2)"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {direction !== 'idle' ? (
        <AnimatedPath
          animatedProps={animatedProps}
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={3}
          strokeDasharray="8 14"
          strokeLinecap="round"
        />
      ) : null}
    </>
  );
}

function FlowNode({
  node,
  scale,
}: {
  node: NodeLayout;
  scale: number;
}) {
  const { colors } = useAppTheme();
  const iconSize = 28 * scale;

  return (
    <View
      pointerEvents="none"
      style={[
        styles.node,
        {
          left: node.x * scale - 45,
          top: node.y * scale - iconSize / 2,
          width: 90,
        },
      ]}>
      <IconSymbol name={node.icon} size={iconSize} color={node.color} />
      <Text numberOfLines={1} style={[styles.nodeLabel, { color: colors.textOnCard }]}>
        {node.label}
      </Text>
      <Text numberOfLines={1} style={[styles.nodeValue, { color: colors.textOnCardSecondary }]}>
        {node.value}
      </Text>
      {node.detail !== 'Idle' ? (
        <Text numberOfLines={1} style={[styles.nodeDetail, { color: node.color }]}>
          {node.detail}
        </Text>
      ) : null}
    </View>
  );
}

function InverterGlyph({ scale }: { scale: number }) {
  return (
    <View style={[styles.inverterGlyph, { transform: [{ scale }] }]}>
      <View style={styles.inverterGlow} />
      <View style={styles.inverterDisplay} />
      <View style={styles.inverterLed} />
      <View style={styles.inverterBaseLine} />
    </View>
  );
}

export function AnimatedEnergyFlow({ data }: { data: SolarSiteStatus }) {
  const { width } = useWindowDimensions();
  const { colors } = useAppTheme();
  const diagramWidth = Math.min(width - 72, 360);
  const scale = diagramWidth / 360;
  const inverter = { x: 180, y: 122 };
  const solar = { x: 180, y: 24 };
  const generatorOn = data.generator_power?.status === 'ON';
  const gridOn = data.grid?.status === 'ON';
  const outputXs = generatorOn ? [44, 135, 225, 316] : [55, 180, 305];

  const nodes: NodeLayout[] = [
    {
      key: 'battery',
      x: outputXs[0],
      y: 212,
      label: 'Battery',
      value: `${Math.round(data.battery?.percentage ?? 0)}% · ${formatKw(Math.abs(data.battery?.kw ?? 0))}`,
      detail:
        data.battery?.direction === 'IN'
          ? 'Charging'
          : data.battery?.direction === 'OUT'
            ? 'Supplying'
            : 'Idle',
      color: '#22C55E',
      icon: 'battery.100.bolt',
      direction: nodeDirection(data.battery, 'idle'),
    },
    {
      key: 'grid',
      x: outputXs[1],
      y: generatorOn ? 224 : 212,
      label: 'Grid',
      value: formatKw(Math.abs(data.grid?.kw ?? 0)),
      detail: gridOn ? 'Connected' : 'Offline',
      color: gridOn ? '#60A5FA' : '#94A3B8',
      icon: 'powerplug.fill',
      direction:
        !gridOn || data.grid?.direction === 'IDLE'
          ? 'idle'
          : data.grid?.direction === 'OUT'
            ? 'forward'
            : 'reverse',
    },
    {
      key: 'home',
      x: outputXs[2],
      y: 212,
      label: 'Usage',
      value: formatKw(Math.abs(data.load?.kw ?? 0)),
      detail: (data.load?.kw ?? 0) > 0 ? 'Using power' : 'Idle',
      color: '#FB7185',
      icon: 'house.fill',
      direction: nodeDirection(data.load, (data.load?.kw ?? 0) > 0 ? 'forward' : 'idle'),
    },
  ];

  if (generatorOn) {
    nodes.push({
      key: 'generator',
      x: outputXs[3],
      y: 224,
      label: 'Generator',
      value: formatKw(Math.abs(data.generator_power?.kw ?? 0)),
      detail: 'Supplying',
      color: '#F97316',
      icon: 'fuelpump.fill',
      direction: data.generator_power?.direction === 'IDLE' ? 'idle' : 'reverse',
    });
  }

  const productionActive = (data.pv?.kw ?? 0) > 0;
  const productionPulse = useSharedValue(0);

  useEffect(() => {
    productionPulse.value = productionActive
      ? withRepeat(
        withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
        -1,
        true,
      )
      : 0;
  }, [productionActive, productionPulse]);

  const productionStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + productionPulse.value * 0.035 }],
  }));

  return (
    <View style={[styles.diagram, { width: diagramWidth, height: 286 * scale }]}>
      <Svg
        width={diagramWidth}
        height={286 * scale}
        viewBox="0 0 360 286"
        preserveAspectRatio="xMidYMid meet">
        <FlowPath
          path={`M ${solar.x} 73 Q ${solar.x} 87 ${inverter.x} 91`}
          color="#F59E0B"
          direction={productionActive ? 'forward' : 'idle'}
        />
        {nodes.map((node) => {
          const dx = node.x - inverter.x;
          const dy = node.y - inverter.y;
          const distance = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
          const ux = dx / distance;
          const uy = dy / distance;
          const startX = inverter.x + ux * 38;
          const startY = inverter.y + uy * 38;
          const endX = node.x - ux * 20;
          const endY = node.y - uy * 20;
          const bendX = startX + (endX - startX) * 0.54;
          const path = `M ${startX} ${startY} Q ${bendX} ${startY} ${endX} ${endY}`;
          return (
            <FlowPath
              key={node.key}
              path={path}
              color={node.color}
              direction={node.direction}
            />
          );
        })}
      </Svg>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.solarNode,
          productionStyle,
          {
            left: solar.x * scale - 44,
            top: solar.y * scale - 11,
          },
        ]}>
        <IconSymbol name="sun.max.fill" size={25 * scale} color="#F59E0B" />
        <Text style={[styles.solarLabel, { color: colors.textOnCard }]}>Solar</Text>
        <Text style={[styles.solarValue, { color: colors.textOnCardSecondary }]}>
          {formatKwp(data.pv?.installed_capacity_kwp)}
        </Text>
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.inverterNode,
          productionStyle,
          {
            left: inverter.x * scale - 52,
            top: inverter.y * scale - 40,
          },
        ]}>
        <InverterGlyph scale={scale} />
        <Text style={[styles.inverterLabel, { color: colors.textOnCard }]}>Production</Text>
        <Text style={[styles.inverterValue, { color: '#F59E0B' }]}>
          {formatKw(data.pv?.kw)}
        </Text>
      </Animated.View>

      {nodes.map((node) => (
        <FlowNode key={node.key} node={node} scale={scale} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  diagram: {
    alignSelf: 'center',
    position: 'relative',
  },
  node: {
    position: 'absolute',
    alignItems: 'center',
  },
  nodeLabel: {
    marginTop: 5,
    fontSize: 11,
    fontWeight: '800',
  },
  nodeValue: {
    marginTop: 1,
    fontSize: 9,
    fontWeight: '600',
  },
  nodeDetail: {
    marginTop: 1,
    fontSize: 9,
    fontWeight: '700',
  },
  solarNode: {
    position: 'absolute',
    width: 88,
    height: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  solarLabel: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: '800',
  },
  solarValue: {
    fontSize: 10,
    fontWeight: '600',
  },
  inverterNode: {
    position: 'absolute',
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inverterLabel: {
    marginTop: 2,
    fontSize: 12,
    fontWeight: '800',
  },
  inverterDetail: {
    marginTop: 1,
    fontSize: 9,
    fontWeight: '600',
  },
  inverterValue: {
    marginTop: 1,
    fontSize: 10,
    fontWeight: '800',
  },
  inverterGlyph: {
    width: 40,
    height: 47,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#F59E0B',
    alignItems: 'center',
    position: 'relative',
  },
  inverterGlow: {
    width: 21,
    height: 6,
    marginTop: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(245,158,11,0.34)',
  },
  inverterDisplay: {
    position: 'absolute',
    left: 7,
    bottom: 9,
    width: 11,
    height: 9,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  inverterLed: {
    position: 'absolute',
    right: 8,
    bottom: 12,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F59E0B',
  },
  inverterBaseLine: {
    position: 'absolute',
    left: 4,
    right: 4,
    bottom: 3,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(245,158,11,0.5)',
  },
});
