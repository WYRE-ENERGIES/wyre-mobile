import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Ellipse,
  G,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from 'react-native-svg';

import { useAppTheme } from '@/context/theme-context';
import { formatKw, formatKwp } from '@/lib/format';
import type { SiteNode, SolarSiteStatus } from '@/lib/solar-types';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const VB_W = 400;
const VB_H = 456;
const NODE_R = 24;
const INV = { x: 200, y: 214 };

function flowPalette(isDark: boolean) {
  if (isDark) {
    return {
      solar: '#C084FC',
      grid: '#60A5FA',
      gridOff: '#94A3B8',
      battery: '#34D399',
      usage: '#FB7185',
      generator: '#FB923C',
      productionFill: '#F59E0B',
      productionIcon: '#FFF7ED',
    };
  }
  return {
    solar: '#7C3AED',
    grid: '#2563EB',
    gridOff: '#64748B',
    battery: '#16A34A',
    usage: '#E11D48',
    generator: '#EA580C',
    productionFill: '#FACC15',
    productionIcon: '#92400E',
  };
}

type FlowDirection = 'forward' | 'reverse' | 'idle';
type GlyphKind = 'solar' | 'grid' | 'generator' | 'storage' | 'facility';

type FlowNode = {
  key: string;
  kind: GlyphKind;
  x: number;
  y: number;
  label: string;
  value: string;
  detail: string;
  color: string;
  direction: FlowDirection;
  labelAbove: boolean;
  badge?: 'ON' | 'OFF';
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

function FlowComet({
  d,
  color,
  direction,
  duration,
  delay = 0,
}: {
  d: string;
  color: string;
  direction: FlowDirection;
  duration: number;
  delay?: number;
}) {
  const progress = useSharedValue(0);
  const active = direction !== 'idle';

  useEffect(() => {
    progress.value = 0;
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration, easing: Easing.linear }), -1, false),
    );
  }, [delay, duration, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: (direction === 'reverse' ? 1 : -1) * progress.value * 280,
  }));

  return (
    <>
      <Path d={d} fill="none" stroke={color} strokeWidth={2} opacity={0.22} strokeLinecap="round" />
      <AnimatedPath
        animatedProps={animatedProps}
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={active ? 3 : 2.4}
        strokeDasharray="16 264"
        strokeLinecap="round"
        opacity={active ? 1 : 0.4}
      />
    </>
  );
}

function SolarGlyph({ color }: { color: string }) {
  return (
    <G>
      <Rect x={-9} y={-8} width={8} height={7} rx={1.1} fill={color} />
      <Rect x={1} y={-8} width={8} height={7} rx={1.1} fill={color} opacity={0.78} />
      <Rect x={-9} y={1} width={8} height={7} rx={1.1} fill={color} opacity={0.78} />
      <Rect x={1} y={1} width={8} height={7} rx={1.1} fill={color} opacity={0.56} />
    </G>
  );
}

function GridGlyph({ color }: { color: string }) {
  return (
    <G>
      <Path
        d="M0 -11 L-6.5 11 M0 -11 L6.5 11 M-4.2 0 H4.2 M-5.4 6 H5.4 M-8 -7.5 H-2.2 M2.2 -7.5 H8"
        fill="none"
        stroke={color}
        strokeWidth={1.55}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </G>
  );
}

function GeneratorGlyph({ color }: { color: string }) {
  return (
    <G>
      <Rect x={-10} y={-6} width={14} height={12} rx={2.2} fill="none" stroke={color} strokeWidth={1.5} />
      <Circle cx={-3} cy={0} r={3.2} fill="none" stroke={color} strokeWidth={1.35} />
      <Circle cx={-3} cy={0} r={1.1} fill={color} />
      <Rect x={4.5} y={-3.2} width={5.5} height={6.4} rx={1} fill="none" stroke={color} strokeWidth={1.35} />
    </G>
  );
}

function StorageGlyph({ color }: { color: string }) {
  return (
    <G>
      {[-7.2, 0, 7.2].map((x) => (
        <G key={x} transform={`translate(${x}, 0)`}>
          <Rect x={-3.1} y={-8} width={6.2} height={16} rx={1.2} fill="none" stroke={color} strokeWidth={1.35} />
          <Rect x={-1.5} y={-10} width={3} height={2} rx={0.6} fill={color} />
        </G>
      ))}
    </G>
  );
}

function FacilityGlyph({ color }: { color: string }) {
  return (
    <G>
      <Path
        d="M-10 9 V-1 H-3.5 V-9 H3.5 V-1 H10 V9 Z"
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
      <Rect x={-2} y={3.2} width={4} height={5.8} rx={0.4} fill={color} />
      <Rect x={-8} y={1} width={3} height={2.3} rx={0.3} fill={color} opacity={0.85} />
      <Rect x={5} y={1} width={3} height={2.3} rx={0.3} fill={color} opacity={0.85} />
    </G>
  );
}

const GLYPHS = {
  solar: SolarGlyph,
  grid: GridGlyph,
  generator: GeneratorGlyph,
  storage: StorageGlyph,
  facility: FacilityGlyph,
} as const;

function AssetNode({
  node,
  fill,
  border,
  labelColor,
  valueColor,
}: {
  node: FlowNode;
  fill: string;
  border: string;
  labelColor: string;
  valueColor: string;
}) {
  const Glyph = GLYPHS[node.kind];
  const labelY = node.labelAbove ? node.y - NODE_R - 22 : node.y + NODE_R + 16;
  const valueY = node.labelAbove ? node.y - NODE_R - 8 : node.y + NODE_R + 29;
  const detailY = node.labelAbove ? node.y - NODE_R - 34 : node.y + NODE_R + 42;

  return (
    <G>
      <Ellipse cx={node.x} cy={node.y + 27} rx={20} ry={6} fill={node.color} opacity={0.18} />
      <Circle cx={node.x} cy={node.y} r={NODE_R + 3} fill={node.color} opacity={0.12} />
      <Circle cx={node.x} cy={node.y} r={NODE_R} fill={fill} stroke={node.color} strokeWidth={1.6} />
      <Circle cx={node.x} cy={node.y} r={NODE_R - 0.8} fill="none" stroke={border} strokeWidth={0.6} />
      <G transform={`translate(${node.x}, ${node.y})`}>
        <Glyph color={node.color} />
      </G>
      {node.badge ? (
        <G>
          <Rect
            x={node.x + 12}
            y={node.y - 28}
            width={30}
            height={14}
            rx={7}
            fill={node.badge === 'ON' ? '#16A34A' : '#DC2626'}
          />
          <SvgText
            x={node.x + 27}
            y={node.y - 18}
            fill="#FFFFFF"
            fontSize={7}
            fontWeight="800"
            textAnchor="middle">
            {node.badge}
          </SvgText>
        </G>
      ) : null}
      {node.detail && node.detail !== 'Idle' && !node.labelAbove ? (
        <SvgText
          x={node.x}
          y={detailY}
          fill={node.color}
          fontSize={8}
          fontWeight="700"
          textAnchor="middle">
          {node.detail}
        </SvgText>
      ) : null}
      <SvgText
        x={node.x}
        y={labelY}
        fill={labelColor}
        fontSize={10}
        fontWeight="700"
        textAnchor="middle">
        {node.label}
      </SvgText>
      <SvgText
        x={node.x}
        y={valueY}
        fill={valueColor}
        fontSize={8}
        fontWeight="600"
        textAnchor="middle">
        {node.value}
      </SvgText>
    </G>
  );
}

function Blueprint({ color }: { color: string }) {
  const vertical = [];
  const horizontal = [];
  for (let x = 20; x < VB_W; x += 32) {
    vertical.push(<Line key={`v${x}`} x1={x} y1={12} x2={x} y2={VB_H - 10} stroke={color} strokeWidth={0.7} />);
  }
  for (let y = 16; y < VB_H; y += 32) {
    horizontal.push(<Line key={`h${y}`} x1={14} y1={y} x2={VB_W - 14} y2={y} stroke={color} strokeWidth={0.7} />);
  }
  return (
    <G>
      {vertical}
      {horizontal}
    </G>
  );
}

function InverterGlyph({ x, y, fill, icon }: { x: number; y: number; fill: string; icon: string }) {
  return (
    <G transform={`translate(${x}, ${y})`}>
      <Circle r={40} fill={fill} opacity={0.22} />
      <Circle r={34} fill={fill} />
      <Rect x={-16} y={-18} width={32} height={38} rx={8} fill="none" stroke={icon} strokeWidth={2.4} />
      <Rect x={-8} y={-10} width={16} height={5} rx={2.5} fill={icon} opacity={0.85} />
      <Rect x={-10} y={4} width={10} height={8} rx={2} fill="none" stroke={icon} strokeWidth={1.8} />
      <Circle cx={8} cy={8} r={2.4} fill={icon} />
      <Rect x={-12} y={15} width={24} height={2.2} rx={1} fill={icon} opacity={0.7} />
    </G>
  );
}

const INV_TOP = INV.y - 34;
const INV_BOTTOM = INV.y + 34;

function inboundPath(x: number, y: number, side: 'left' | 'center' | 'right') {
  const startY = y + NODE_R;
  const midY = INV_TOP - 28;
  if (side === 'center') {
    return `M ${x} ${startY} L ${INV.x} ${INV_TOP}`;
  }
  const endX = side === 'left' ? INV.x - 18 : INV.x + 18;
  return `M ${x} ${startY} C ${x} ${midY}, ${endX} ${midY}, ${endX} ${INV_TOP}`;
}

function outboundPath(x: number, y: number, side: 'left' | 'right') {
  const endY = y - NODE_R;
  const midY = INV_BOTTOM + 28;
  const startX = side === 'left' ? INV.x - 18 : INV.x + 18;
  return `M ${startX} ${INV_BOTTOM} C ${startX} ${midY}, ${x} ${midY}, ${x} ${endY}`;
}

export function AnimatedEnergyFlow({ data }: { data: SolarSiteStatus }) {
  const { width } = useWindowDimensions();
  const { isDark } = useAppTheme();
  const generatorOn =
    data.generator_power?.status === 'ON' || (data.generator_power?.kw ?? 0) > 0;
  const gridOn = data.grid?.status === 'ON';
  const productionActive = (data.pv?.kw ?? 0) > 0;
  const flow = flowPalette(isDark);
  const labelColor = isDark ? '#FFFFFF' : '#111827';
  const valueColor = isDark ? 'rgba(255,255,255,0.72)' : '#4B5563';
  const topY = 82;
  const botY = 368;
  const solarX = generatorOn ? 58 : 80;
  const gridX = generatorOn ? 200 : 320;
  const genX = 342;
  const batteryX = 80;
  const usageX = 320;

  const nodes: FlowNode[] = [
    {
      key: 'solar',
      kind: 'solar',
      x: solarX,
      y: topY,
      label: 'Solar',
      value: formatKwp(data.pv?.installed_capacity_kwp),
      detail: productionActive ? 'Producing' : 'Idle',
      color: flow.solar,
      direction: productionActive ? 'forward' : 'idle',
      labelAbove: true,
    },
    {
      key: 'grid',
      kind: 'grid',
      x: gridX,
      y: topY,
      label: 'Grid',
      value: formatKw(Math.abs(data.grid?.kw ?? 0)),
      detail: gridOn ? 'Connected' : 'Offline',
      color: gridOn ? flow.grid : flow.gridOff,
      direction: gridOn ? 'forward' : 'idle',
      labelAbove: true,
      badge: data.grid?.status === 'ON' || data.grid?.status === 'OFF' ? data.grid.status : undefined,
    },
    {
      key: 'battery',
      kind: 'storage',
      x: batteryX,
      y: botY,
      label: 'Battery',
      value: `${Math.round(data.battery?.percentage ?? 0)}% · ${formatKw(Math.abs(data.battery?.kw ?? 0))}`,
      detail:
        data.battery?.direction === 'IN'
          ? 'Charging'
          : data.battery?.direction === 'OUT'
            ? 'Supplying'
            : 'Idle',
      color: flow.battery,
      direction: nodeDirection(data.battery, 'idle'),
      labelAbove: false,
    },
    {
      key: 'usage',
      kind: 'facility',
      x: usageX,
      y: botY,
      label: 'Usage',
      value: formatKw(Math.abs(data.load?.kw ?? 0)),
      detail: (data.load?.kw ?? 0) > 0 ? 'Using power' : 'Idle',
      color: flow.usage,
      direction: nodeDirection(data.load, (data.load?.kw ?? 0) > 0 ? 'forward' : 'idle'),
      labelAbove: false,
    },
  ];

  if (generatorOn) {
    nodes.splice(2, 0, {
      key: 'generator',
      kind: 'generator',
      x: genX,
      y: topY,
      label: 'Generator',
      value: formatKw(Math.abs(data.generator_power?.kw ?? 0)),
      detail: 'Supplying',
      color: flow.generator,
      direction: data.generator_power?.direction === 'IDLE' ? 'idle' : 'forward',
      labelAbove: true,
    });
  }

  const diagramWidth = Math.min(width - 56, 400);
  const diagramHeight = diagramWidth * (VB_H / VB_W);
  const nodeFill = isDark ? 'rgba(23, 23, 26, 0.96)' : '#FFFFFF';
  const nodeBorder = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(15, 23, 42, 0.08)';
  const gridColor = isDark ? 'rgba(196, 160, 255, 0.08)' : 'rgba(15, 23, 42, 0.06)';

  const solar = nodes.find((node) => node.key === 'solar')!;
  const grid = nodes.find((node) => node.key === 'grid')!;
  const generator = nodes.find((node) => node.key === 'generator');
  const battery = nodes.find((node) => node.key === 'battery')!;
  const usage = nodes.find((node) => node.key === 'usage')!;

  return (
    <View
      accessible
      accessibilityLabel="Live energy flow from solar and grid into Wyre production, then out to battery and facility usage"
      style={[styles.diagram, { width: diagramWidth, height: diagramHeight }]}>
      <Svg width={diagramWidth} height={diagramHeight} viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet">
        <Blueprint color={gridColor} />

        <FlowComet d={inboundPath(solar.x, solar.y, 'left')} color={solar.color} direction={solar.direction} duration={2400} delay={0} />
        <FlowComet
          d={inboundPath(grid.x, grid.y, generatorOn ? 'center' : 'right')}
          color={grid.color}
          direction={grid.direction}
          duration={2600}
          delay={450}
        />
        {generator ? (
          <FlowComet
            d={inboundPath(generator.x, generator.y, 'right')}
            color={generator.color}
            direction={generator.direction}
            duration={2500}
            delay={900}
          />
        ) : null}
        <FlowComet d={outboundPath(battery.x, battery.y, 'left')} color={battery.color} direction={battery.direction} duration={2700} delay={1350} />
        <FlowComet d={outboundPath(usage.x, usage.y, 'right')} color={usage.color} direction={usage.direction} duration={2550} delay={1800} />

        {nodes.map((node) => (
          <AssetNode
            key={node.key}
            node={node}
            fill={nodeFill}
            border={nodeBorder}
            labelColor={labelColor}
            valueColor={valueColor}
          />
        ))}

        <Ellipse cx={INV.x} cy={INV_BOTTOM + 8} rx={32} ry={8} fill={flow.productionFill} opacity={0.2} />
        <InverterGlyph x={INV.x} y={INV.y} fill={flow.productionFill} icon={flow.productionIcon} />
        <SvgText
          x={INV.x}
          y={INV_BOTTOM + 24}
          fill={labelColor}
          fontSize={13}
          fontWeight="800"
          textAnchor="middle">
          Production
        </SvgText>
        <SvgText
          x={INV.x}
          y={INV_BOTTOM + 42}
          fill={labelColor}
          fontSize={12}
          fontWeight="800"
          textAnchor="middle">
          {formatKw(data.pv?.kw)}
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  diagram: {
    alignSelf: 'center',
  },
});
