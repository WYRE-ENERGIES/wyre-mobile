import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  Line,
  LinearGradient,
  Path,
  Rect,
  Stop,
  Text as SvgText,
} from 'react-native-svg';

import { useAppTheme } from '@/context/theme-context';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const VB_W = 390;
const VB_H = 318;

const HUB = { x: 195, y: 156, w: 150, h: 72 };
const NODES = {
  solar: { x: 66, y: 64, label: 'Solar', color: '#FCCC43', labelAbove: true },
  grid: { x: 195, y: 64, label: 'Grid', color: '#67B4FF', labelAbove: true },
  generator: { x: 324, y: 64, label: 'Generator', color: '#F58220', labelAbove: true },
  storage: { x: 66, y: 266, label: 'Storage', color: '#34D399', labelAbove: false },
  facility: { x: 195, y: 266, label: 'Facility', color: '#C4A0FF', labelAbove: false },
  insights: { x: 324, y: 266, label: 'Insights', color: '#5EEAD4', labelAbove: false },
} as const;

const NODE_R = 25;

type DiagramTone = 'hero' | 'backdrop';

type Palette = {
  grid: string;
  nodeFill: string;
  nodeBorder: string;
  label: string;
  hubStroke: string;
  hubText: string;
  hubSub: string;
  scan: string;
};

function getPalette(isDark: boolean): Palette {
  if (isDark) {
    return {
      grid: 'rgba(196, 160, 255, 0.07)',
      nodeFill: 'rgba(14, 4, 28, 0.88)',
      nodeBorder: 'rgba(255,255,255,0.14)',
      label: 'rgba(255,255,255,0.86)',
      hubStroke: 'rgba(232, 204, 255, 0.55)',
      hubText: '#FFFFFF',
      hubSub: 'rgba(255,255,255,0.72)',
      scan: 'rgba(196, 160, 255, 0.55)',
    };
  }
  return {
    grid: 'rgba(92, 18, 167, 0.06)',
    nodeFill: '#FFFFFF',
    nodeBorder: 'rgba(92, 18, 167, 0.16)',
    label: '#3B0764',
    hubStroke: 'rgba(92, 18, 167, 0.35)',
    hubText: '#FFFFFF',
    hubSub: 'rgba(255,255,255,0.8)',
    scan: 'rgba(92, 18, 167, 0.45)',
  };
}

function Comet({
  d,
  color,
  duration,
  reverse,
}: {
  d: string;
  color: string;
  duration: number;
  reverse?: boolean;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.linear }),
      -1,
      false,
    );
  }, [duration, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: (reverse ? 1 : -1) * progress.value * 240,
  }));

  return (
    <>
      <Path d={d} fill="none" stroke={color} strokeWidth={2} opacity={0.22} strokeLinecap="round" />
      <AnimatedPath
        animatedProps={animatedProps}
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={2.6}
        strokeDasharray="11 229"
        strokeLinecap="round"
        opacity={0.95}
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

function InsightsGlyph({ color }: { color: string }) {
  return (
    <G>
      <Path
        d="M-9 5 L-4 0.5 L1 3.5 L9 -6"
        fill="none"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={9} cy={-6} r={1.7} fill={color} />
      <Path d="M-9 8 H9" stroke={color} strokeWidth={1} opacity={0.35} strokeLinecap="round" />
    </G>
  );
}

const GLYPHS = {
  solar: SolarGlyph,
  grid: GridGlyph,
  generator: GeneratorGlyph,
  storage: StorageGlyph,
  facility: FacilityGlyph,
  insights: InsightsGlyph,
} as const;

function AssetNode({
  x,
  y,
  label,
  color,
  kind,
  fill,
  border,
  labelColor,
  labelAbove,
}: {
  x: number;
  y: number;
  label: string;
  color: string;
  kind: keyof typeof GLYPHS;
  fill: string;
  border: string;
  labelColor: string;
  labelAbove: boolean;
}) {
  const Glyph = GLYPHS[kind];
  return (
    <G>
      <Ellipse cx={x} cy={y + 27} rx={20} ry={6} fill={color} opacity={0.18} />
      <Circle cx={x} cy={y} r={NODE_R + 3} fill={color} opacity={0.12} />
      <Circle cx={x} cy={y} r={NODE_R} fill={fill} stroke={color} strokeWidth={1.6} />
      <Circle cx={x} cy={y} r={NODE_R - 0.8} fill="none" stroke={border} strokeWidth={0.6} />
      <G transform={`translate(${x}, ${y})`}>
        <Glyph color={color} />
      </G>
      <SvgText
        x={x}
        y={labelAbove ? y - NODE_R - 8 : y + NODE_R + 16}
        fill={labelColor}
        fontSize={10}
        fontWeight="700"
        textAnchor="middle">
        {label}
      </SvgText>
    </G>
  );
}

function Blueprint({ color }: { color: string }) {
  const vertical = [];
  const horizontal = [];
  for (let x = 18; x < VB_W; x += 30) {
    vertical.push(<Line key={`v${x}`} x1={x} y1={10} x2={x} y2={VB_H - 8} stroke={color} strokeWidth={0.7} />);
  }
  for (let y = 14; y < VB_H; y += 30) {
    horizontal.push(<Line key={`h${y}`} x1={12} y1={y} x2={VB_W - 12} y2={y} stroke={color} strokeWidth={0.7} />);
  }
  return (
    <G>
      {vertical}
      {horizontal}
    </G>
  );
}

export function EnergyOpsDiagram({ tone = 'hero' }: { tone?: DiagramTone }) {
  const { width, height } = useWindowDimensions();
  const { isDark } = useAppTheme();
  const palette = getPalette(isDark);
  const scan = useSharedValue(0);
  const pulse = useSharedValue(0);

  useEffect(() => {
    scan.value = withRepeat(withTiming(1, { duration: 9000, easing: Easing.linear }), -1, false);
    pulse.value = withRepeat(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }), -1, true);
  }, [pulse, scan]);

  const scanProps = useAnimatedProps(() => ({
    strokeDashoffset: -scan.value * 40,
  }));

  const pulseProps = useAnimatedProps(() => ({
    opacity: 0.12 + pulse.value * 0.16,
    r: 58 + pulse.value * 6,
  }));

  const widthCap = Math.min(width * (tone === 'hero' ? 1 : 0.9), 500);
  const heightCap = height * (tone === 'hero' ? 0.46 : 0.3);
  const svgHeight = Math.min(widthCap * (VB_H / VB_W), heightCap);
  const svgWidth = svgHeight * (VB_W / VB_H);
  const hubX = HUB.x - HUB.w / 2;
  const hubY = HUB.y - HUB.h / 2;

  const inbound = {
    solar: `M ${NODES.solar.x} ${NODES.solar.y + NODE_R} C ${NODES.solar.x} 110, ${hubX + 18} 110, ${hubX + 28} ${hubY}`,
    grid: `M ${NODES.grid.x} ${NODES.grid.y + NODE_R} L ${NODES.grid.x} ${hubY}`,
    generator: `M ${NODES.generator.x} ${NODES.generator.y + NODE_R} C ${NODES.generator.x} 110, ${hubX + HUB.w - 18} 110, ${hubX + HUB.w - 28} ${hubY}`,
  };
  const outbound = {
    storage: `M ${hubX + 28} ${hubY + HUB.h} C ${hubX + 18} 216, ${NODES.storage.x} 216, ${NODES.storage.x} ${NODES.storage.y - NODE_R}`,
    facility: `M ${NODES.facility.x} ${hubY + HUB.h} L ${NODES.facility.x} ${NODES.facility.y - NODE_R}`,
    insights: `M ${hubX + HUB.w - 28} ${hubY + HUB.h} C ${hubX + HUB.w - 18} 216, ${NODES.insights.x} 216, ${NODES.insights.x} ${NODES.insights.y - NODE_R}`,
  };

  return (
    <View
      accessible
      accessibilityLabel="Flowchart of Wyre tracking solar, grid, and generator power through to facility storage and insights"
      pointerEvents="none"
      style={[styles.wrap, { width: svgWidth, height: svgHeight, opacity: tone === 'backdrop' ? 0.92 : 1 }]}>
      <Svg width={svgWidth} height={svgHeight} viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="xMidYMid meet">
        <Defs>
          <LinearGradient id={`hubFill-${tone}`} x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#7A22D8" />
            <Stop offset="1" stopColor="#4C0E96" />
          </LinearGradient>
        </Defs>

        <Blueprint color={palette.grid} />

        <Comet d={inbound.solar} color={NODES.solar.color} duration={2400} />
        <Comet d={inbound.grid} color={NODES.grid.color} duration={2100} />
        <Comet d={inbound.generator} color={NODES.generator.color} duration={2600} />
        <Comet d={outbound.storage} color={NODES.storage.color} duration={2500} />
        <Comet d={outbound.facility} color={NODES.facility.color} duration={2300} />
        <Comet d={outbound.insights} color={NODES.insights.color} duration={2700} />

        {(Object.keys(NODES) as (keyof typeof NODES)[]).map((key) => (
          <AssetNode
            key={key}
            kind={key}
            x={NODES[key].x}
            y={NODES[key].y}
            label={NODES[key].label}
            color={NODES[key].color}
            fill={palette.nodeFill}
            border={palette.nodeBorder}
            labelColor={palette.label}
            labelAbove={NODES[key].labelAbove}
          />
        ))}

        <Ellipse cx={HUB.x} cy={hubY + HUB.h + 10} rx={78} ry={10} fill="#6e11cb" opacity={isDark ? 0.28 : 0.14} />
        <AnimatedCircle animatedProps={pulseProps} cx={HUB.x} cy={HUB.y} fill="#9D4EDD" />
        <AnimatedRect
          animatedProps={scanProps}
          x={hubX - 10}
          y={hubY - 10}
          width={HUB.w + 20}
          height={HUB.h + 20}
          rx={24}
          fill="none"
          stroke={palette.scan}
          strokeWidth={1.15}
          strokeDasharray="7 11"
          opacity={0.7}
        />
        <Rect
          x={hubX}
          y={hubY}
          width={HUB.w}
          height={HUB.h}
          rx={20}
          fill={`url(#hubFill-${tone})`}
          // stroke={palette.hubStroke}
          strokeWidth={1.4}
        />
        {/* <Circle cx={hubX + 32} cy={HUB.y - 8} r={8} fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.4)" strokeWidth={1} />
        <Circle cx={hubX + 32} cy={HUB.y - 8} r={3.2} fill="#FCCC43" /> */}
        <SvgText
          x={HUB.x + 3}
          y={HUB.y - 3}
          fill={palette.hubText}
          fontSize={16}
          fontWeight="800"
          textAnchor="middle">
          WYRE
        </SvgText>
        <SvgText
          x={HUB.x}
          y={HUB.y + 18}
          fill={palette.hubSub}
          fontSize={9}
          fontWeight="600"
          textAnchor="middle">
          TRACK  ·  MANAGE
        </SvgText>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignSelf: 'center',
  },
});
