import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G, Line, Path, Rect, Text as SvgText } from 'react-native-svg';

import { SolarCard } from '@/components/solar/solar-card';
import { WyreColors } from '@/constants/theme';
import type { SolarSiteStatus } from '@/lib/solar-types';

const AnimatedPath = Animated.createAnimatedComponent(Path);

type FlowDiagramProps = {
  data: SolarSiteStatus;
};

/**
 * Cropped web viewBox, wide enough for left + right node labels.
 * Grid/Usage labels sit near x≈790, so right edge must clear ~800.
 */
const VIEWBOX = { minX: -175, minY: 0, width: 980, height: 320 };
const ASPECT_RATIO = VIEWBOX.height / VIEWBOX.width;

const FLOW_DURATION_MS = 2200;
const FLOW_PULSE_DELAYS = [0, 600, 1200];

const EXPANDED_HEADER_HEIGHT = 56;

/** SVG text sizes — slightly larger than web so they stay readable when scaled down. */
const FONT = {
  productionValue: 16,
  productionLabel: 12,
  nodeLabel: 15,
  nodeValue: 14,
  nodeStatus: 13,
  percentage: 14,
  pill: 11,
};

type NodeConfig = {
  x: number;
  y: number;
  r: number;
  color: string;
  bg: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
  percentage?: number;
  direction?: string;
  status?: string;
  flowStatus?: string;
  statusColor?: string;
};

type DiagramSize = {
  width: number;
  height: number;
};

function AnimatedFlowPath({ d, color, delay = 0 }: { d: string; color: string; delay?: number }) {
  const dashOffset = useSharedValue(300);

  useEffect(() => {
    dashOffset.value = withDelay(
      delay,
      withRepeat(
        withTiming(0, { duration: FLOW_DURATION_MS, easing: Easing.linear }),
        -1,
        false,
      ),
    );
  }, [dashOffset, delay]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  return (
    <AnimatedPath
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="12 260"
      opacity={0.9}
      animatedProps={animatedProps}
    />
  );
}

function useFlowNodes(data: SolarSiteStatus) {
  const { pv, battery, grid, load, generator_power: generatorPower } = data;
  const generatorStatusNorm = String(generatorPower?.status ?? '')
    .trim()
    .toUpperCase();
  const showGenerator = generatorStatusNorm === 'ON';

  const batteryKw = battery?.kw ?? 0;
  const batteryStatus =
    batteryKw > 0 ? 'Discharging' : batteryKw < 0 ? 'Charging' : 'Idle';
  const batteryStatusColor =
    batteryStatus === 'Discharging'
      ? '#58B90A'
      : batteryStatus === 'Charging'
        ? '#D7C6F3'
        : '#9ca3af';

  const production = pv?.kw ?? 0;
  const capacity = pv?.installed_capacity_kwp ?? 0;
  const capacityPercentage = pv?.percentage ?? 0;

  const generatorKw = generatorPower?.kw ?? 0;
  const generatorFlowStatus = generatorKw > 0 ? 'Supplying' : 'Idle';
  const generatorFlowColor = generatorKw > 0 ? '#ea580c' : '#9ca3af';

  const nodes: Record<string, NodeConfig> = useMemo(
    () => ({
      production: {
        x: 300,
        y: 160,
        r: 62,
        color: '#f59e0b',
        bg: '#fde68a',
        icon: 'white-balance-sunny',
        label: 'Production',
        value: `${production.toFixed(2)} kW`,
      },
      capacity: {
        x: -40,
        y: 50,
        r: 38,
        color: '#6d28d9',
        bg: '#f3e8ff',
        icon: 'gauge',
        label: 'Capacity',
        value: `${capacity} kWp`,
        percentage: capacityPercentage,
        direction: pv?.direction,
      },
      ...(showGenerator
        ? {
            generator: {
              x: -40,
              y: 160,
              r: 24,
              color: '#c2410c',
              bg: '#ffedd5',
              icon: 'engine',
              label: 'Generator',
              value: `${generatorKw.toFixed(2)} kW`,
              direction: generatorPower?.direction,
              status: generatorPower?.status,
              flowStatus: generatorFlowStatus,
              statusColor: generatorFlowColor,
            },
          }
        : {}),
      battery: {
        x: -40,
        y: 270,
        r: 38,
        color: '#16a34a',
        bg: '#dcfce7',
        icon: 'battery',
        label: 'Battery',
        value: `${(battery?.kw ?? 0).toFixed(2)} kW`,
        percentage: battery?.percentage ?? 0,
        direction: battery?.direction,
        status: batteryStatus,
        statusColor: batteryStatusColor,
      },
      grid: {
        x: 660,
        y: 50,
        r: 38,
        color: '#2563eb',
        bg: '#dbeafe',
        icon: 'transmission-tower',
        label: 'Grid',
        value: `${(grid?.kw ?? 0).toFixed(2)} kW`,
        direction: grid?.direction,
        status: grid?.status,
      },
      usage: {
        x: 660,
        y: 270,
        r: 38,
        color: '#dc2626',
        bg: '#fee2e2',
        icon: 'home-lightning-bolt-outline',
        label: 'Usage',
        value: `${(load?.kw ?? 0).toFixed(2)} kW`,
        direction: load?.direction,
      },
    }),
    [
      battery,
      batteryStatus,
      batteryStatusColor,
      capacity,
      capacityPercentage,
      generatorFlowColor,
      generatorFlowStatus,
      generatorKw,
      generatorPower?.direction,
      generatorPower?.status,
      grid,
      load,
      production,
      pv?.direction,
      showGenerator,
    ],
  );

  return { nodes, showGenerator };
}

function FlowDiagramCanvas({
  data,
  size,
}: {
  data: SolarSiteStatus;
  size: DiagramSize;
}) {
  const { nodes, showGenerator } = useFlowNodes(data);
  const { width: diagramWidth, height: diagramHeight } = size;
  const renderScale = diagramWidth / VIEWBOX.width;
  const renderedContentHeight = VIEWBOX.height * renderScale;
  const contentOffsetY = (diagramHeight - renderedContentHeight) / 2;
  const scale = renderScale;

  const connectors = [
    { from: 'capacity', to: 'production', color: nodes.capacity.color, side: 'left' as const, offset: -28 },
    ...(showGenerator
      ? [{ from: 'generator', to: 'production', color: nodes.generator.color, side: 'left' as const, offset: -8 }]
      : []),
    { from: 'battery', to: 'production', color: nodes.battery.color, side: 'left' as const, offset: 12 },
    { from: 'grid', to: 'production', color: nodes.grid.color, side: 'right' as const, offset: -18 },
    { from: 'usage', to: 'production', color: nodes.usage.color, side: 'right' as const, offset: 22 },
  ];

  const toScreenX = (x: number) => ((x - VIEWBOX.minX) / VIEWBOX.width) * diagramWidth;
  const toScreenY = (y: number) =>
    contentOffsetY + ((y - VIEWBOX.minY) / VIEWBOX.height) * renderedContentHeight;

  return (
    <View style={[styles.diagramContainer, { width: diagramWidth, height: diagramHeight }]}>
      <Svg
        width={diagramWidth}
        height={diagramHeight}
        viewBox={`${VIEWBOX.minX} ${VIEWBOX.minY} ${VIEWBOX.width} ${VIEWBOX.height}`}
        preserveAspectRatio="xMidYMid meet">
        {connectors.map(({ from, to, color, side, offset }, idx) => {
          const start = nodes[from];
          const end = nodes[to];
          if (!start || !end) return null;

          const direction = start.direction;
          const isIdle = direction === 'IDLE';
          const startStatus = String(start.status ?? '')
            .trim()
            .toUpperCase();
          const isSourceOff =
            startStatus === 'OFF' && (from === 'grid' || from === 'generator');

          let sx: number;
          let sy: number;
          let ex: number;
          let ey: number;

          if (direction === 'OUT') {
            sx = start.x + (start.x < end.x ? start.r : -start.r);
            sy = start.y;
            ex = end.x + (side === 'left' ? -end.r : end.r);
            ey = end.y + offset;
          } else if (direction === 'IN') {
            sx = end.x + (side === 'left' ? -end.r : end.r);
            sy = end.y + offset;
            ex = start.x + (start.x < end.x ? start.r : -start.r);
            ey = start.y;
          } else {
            sx = start.x + (start.x < end.x ? start.r : -start.r);
            sy = start.y;
            ex = end.x + (side === 'left' ? -end.r : end.r);
            ey = end.y + offset;
          }

          const midX1 = sx + (ex - sx) * 0.25;
          const midX2 = sx + (ex - sx) * 0.75;
          const pathD = `M ${sx},${sy} Q ${(sx + midX1) / 2},${sy} ${midX1},${sy} L ${midX2},${ey} Q ${(midX2 + ex) / 2},${ey} ${ex},${ey}`;
          const showFlow = !isIdle && !isSourceOff;

          return (
            <G key={idx}>
              <Path
                d={pathD}
                fill="none"
                stroke="#DDD"
                strokeWidth={2}
                strokeLinecap="round"
                opacity={0.45}
              />
              {showFlow
                ? FLOW_PULSE_DELAYS.map((delay, pulseIdx) => (
                    <AnimatedFlowPath
                      key={`${idx}-${pulseIdx}`}
                      d={pathD}
                      color={color}
                      delay={delay}
                    />
                  ))
                : null}
            </G>
          );
        })}

        {showGenerator && nodes.generator ? (
          <Line
            x1={nodes.capacity.x}
            y1={nodes.capacity.y + nodes.capacity.r}
            x2={nodes.generator.x}
            y2={nodes.generator.y - nodes.generator.r}
            stroke={nodes.capacity.color}
            strokeWidth={2.5}
            strokeDasharray="7 5"
            strokeLinecap="round"
            opacity={0.72}
          />
        ) : null}

        {Object.entries(nodes).map(([key, n]) => {
          let labelOffsetX = 0;
          let textAnchor: 'start' | 'middle' | 'end' = 'middle';

          if (key === 'capacity' || key === 'battery' || key === 'generator') {
            const labelR = key === 'generator' ? nodes.capacity.r : n.r;
            labelOffsetX = -labelR - 88;
            textAnchor = 'start';
          } else if (key === 'grid' || key === 'usage') {
            labelOffsetX = n.r + 88;
            textAnchor = 'end';
          }

          const pillOn = String(n.status ?? '')
            .trim()
            .toUpperCase() === 'ON';

          return (
            <G key={key}>
              <Circle cx={n.x} cy={n.y} r={n.r} fill={n.bg} stroke={n.color} strokeWidth={2} />

              {['capacity', 'battery'].includes(key) && n.percentage !== undefined ? (
                <Circle
                  cx={n.x}
                  cy={n.y}
                  r={n.r + 5}
                  fill="none"
                  stroke={n.color}
                  strokeWidth={4}
                  strokeDasharray={`${(2 * Math.PI * (n.r + 5) * n.percentage) / 100} ${2 * Math.PI * (n.r + 5)}`}
                  strokeLinecap="round"
                  opacity={0.6}
                />
              ) : null}

              {(key === 'grid' || key === 'generator') && (
                <G transform={`translate(${n.x + n.r - 24}, ${n.y - n.r - 10})`}>
                  <Rect
                    x={0}
                    y={0}
                    rx={10}
                    ry={10}
                    width={40}
                    height={18}
                    fill={pillOn ? '#22c55e' : '#ef4444'}
                    stroke="#fff"
                    strokeWidth={1.5}
                  />
                  <SvgText
                    x={20}
                    y={13}
                    textAnchor="middle"
                    fontSize={FONT.pill}
                    fontWeight="700"
                    fill="#ffffff">
                    {pillOn ? 'ON' : 'OFF'}
                  </SvgText>
                </G>
              )}

              {['capacity', 'battery'].includes(key) && n.percentage !== undefined ? (
                <SvgText
                  x={n.x + (key === 'capacity' ? n.r + 16 : n.r + 17)}
                  y={n.y - 10}
                  textAnchor="start"
                  fontSize={FONT.percentage}
                  fill={n.color}
                  fontWeight="600">
                  {n.percentage}%
                </SvgText>
              ) : null}

              {key === 'production' ? (
                <>
                  <SvgText
                    x={n.x}
                    y={n.y - n.r - 18}
                    textAnchor="middle"
                    fontSize={FONT.productionValue}
                    fill={n.color}
                    fontWeight="600">
                    {n.value}
                  </SvgText>
                  <SvgText
                    x={n.x}
                    y={n.y - n.r - 36}
                    textAnchor="middle"
                    fontSize={FONT.productionLabel}
                    fill="#555">
                    {n.label}
                  </SvgText>
                </>
              ) : (
                <>
                  <SvgText
                    x={n.x + labelOffsetX}
                    y={n.y - 34}
                    textAnchor={textAnchor}
                    fontSize={FONT.nodeLabel}
                    fill="#111827"
                    fontWeight="600">
                    {n.label}
                  </SvgText>
                  <SvgText
                    x={n.x + labelOffsetX}
                    y={n.y - 12}
                    textAnchor={textAnchor}
                    fontSize={FONT.nodeValue}
                    fill="#6B7280">
                    {n.value}
                  </SvgText>
                  {(key === 'battery' || key === 'generator') && (
                    <SvgText
                      x={n.x + labelOffsetX}
                      y={n.y + 6}
                      textAnchor={textAnchor}
                      fontSize={FONT.nodeStatus}
                      fontWeight="600"
                      fill={n.statusColor ?? '#9ca3af'}>
                      {key === 'battery' ? n.status : n.flowStatus}
                    </SvgText>
                  )}
                </>
              )}
            </G>
          );
        })}
      </Svg>

      {Object.entries(nodes).map(([key, n]) => {
        const iconSize = Math.max(n.r * 0.55 * scale, 16);

        return (
          <View
            key={`icon-${key}`}
            pointerEvents="none"
            style={[
              styles.iconOverlay,
              {
                left: toScreenX(n.x) - iconSize / 2,
                top: toScreenY(n.y) - iconSize / 2,
                width: iconSize,
                height: iconSize,
              },
            ]}>
            <MaterialCommunityIcons name={n.icon} size={iconSize} color={n.color} />
          </View>
        );
      })}
    </View>
  );
}

function getCompactSize(windowWidth: number): DiagramSize {
  // Screen padding 20×2 + card padding ~12×2
  const width = Math.max(windowWidth - 64, 300);
  return {
    width,
    height: width * ASPECT_RATIO * 1.2,
  };
}

function getFittedSize(availableWidth: number, availableHeight: number): DiagramSize {
  const width = Math.max(availableWidth, 320);
  const maxHeight = Math.max(availableHeight, 240);
  const naturalHeight = width * ASPECT_RATIO * 1.15;
  const height = Math.min(naturalHeight, maxHeight);
  const fittedWidth = height / (ASPECT_RATIO * 1.15);

  return {
    width: Math.min(width, fittedWidth),
    height,
  };
}

export function FlowDiagram({ data }: FlowDiagramProps) {
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const [expanded, setExpanded] = useState(false);

  const compactSize = getCompactSize(windowWidth);

  // The app is locked to portrait, so the enlarged view rotates its own content
  // instead of the device. Width and height swap: the stage is as wide as the
  // screen is tall.
  const stageWidth = windowHeight;
  const stageHeight = windowWidth;
  const stagePaddingLeft = insets.top + 16;
  const stagePaddingRight = insets.bottom + 16;

  const expandedSize = getFittedSize(
    stageWidth - stagePaddingLeft - stagePaddingRight - 16,
    stageHeight - EXPANDED_HEADER_HEIGHT - 24,
  );

  return (
    <>
      <Pressable
        onPress={() => setExpanded(true)}
        accessibilityRole="button"
        accessibilityLabel="Site status. Double tap to enlarge."
        accessibilityHint="Opens a full screen landscape view of the energy flow diagram">
        <SolarCard style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>Site status</Text>
              <Text style={styles.cardSubtitle}>Live energy flow across your system</Text>
            </View>
            <View style={styles.enlargeChip}>
              <MaterialCommunityIcons
                name="phone-rotate-landscape"
                size={14}
                color={WyreColors.purple}
              />
              <Text style={styles.enlargeChipText}>Enlarge</Text>
            </View>
          </View>

          <View style={styles.compactCanvas}>
            <FlowDiagramCanvas data={data} size={compactSize} />
          </View>
        </SolarCard>
      </Pressable>

      <Modal
        visible={expanded}
        animationType="fade"
        presentationStyle="fullScreen"
        onRequestClose={() => setExpanded(false)}>
        <View style={styles.expandedRoot}>
          <View
            style={[
              styles.expandedStage,
              {
                width: stageWidth,
                height: stageHeight,
                left: (windowWidth - stageWidth) / 2,
                top: (windowHeight - stageHeight) / 2,
                paddingLeft: stagePaddingLeft,
                paddingRight: stagePaddingRight,
              },
            ]}>
            <View style={[styles.expandedHeader, { height: EXPANDED_HEADER_HEIGHT }]}>
              <View style={styles.expandedHeaderText}>
                <Text style={styles.expandedTitle}>Site status</Text>
                <Text style={styles.expandedSubtitle}>
                  Live energy flow — turn your phone sideways
                </Text>
              </View>
              <Pressable
                style={styles.closeButton}
                onPress={() => setExpanded(false)}
                accessibilityRole="button"
                accessibilityLabel="Close enlarged site status">
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable>
            </View>

            <View style={styles.expandedBody}>
              <FlowDiagramCanvas data={data} size={expandedSize} />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 10,
    paddingVertical: 14,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  cardHeaderText: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: WyreColors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 13,
    color: WyreColors.textSecondary,
  },
  enlargeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#f3e8ff',
  },
  enlargeChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: WyreColors.purple,
  },
  compactCanvas: {
    alignItems: 'center',
  },
  diagramContainer: {
    position: 'relative',
    overflow: 'hidden',
  },
  iconOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  expandedRoot: {
    flex: 1,
    backgroundColor: WyreColors.pageBg,
    overflow: 'hidden',
  },
  expandedStage: {
    position: 'absolute',
    transform: [{ rotate: '90deg' }],
  },
  expandedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    gap: 12,
  },
  expandedHeaderText: {
    flex: 1,
    gap: 2,
  },
  expandedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: WyreColors.textPrimary,
  },
  expandedSubtitle: {
    fontSize: 14,
    color: WyreColors.textSecondary,
  },
  closeButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: WyreColors.purple,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  expandedBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WyreColors.surface,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
});
