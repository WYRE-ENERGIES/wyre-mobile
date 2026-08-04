import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg';

type CircleGaugeProps = {
  percentage: number;
  size?: number;
  segments?: number;
  label?: string;
  activeColor?: string;
};

const GAUGE_PURPLE = '#7B61FF';
const GAUGE_INACTIVE = '#E6E9EE';

export function CircleGauge({
  percentage,
  size = 175,
  segments = 30,
  label = 'Power',
  activeColor = GAUGE_PURPLE,
}: CircleGaugeProps) {  const cx = size / 2;
  const cy = size / 2;
  const inner = size * 0.34;
  const outer = size * 0.45;
  const clamped = Math.min(Math.max(percentage, 0), 100);
  const activeSegments = Math.round((clamped / 100) * segments);
  const displayPercent = Math.round(clamped);
  const centerFontSize = size <= 130 ? 18 : 22;
  const labelFontSize = size <= 130 ? 10 : 12;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <G transform={`translate(${cx}, ${cy})`}>        {Array.from({ length: segments }).map((_, i) => {
          const angle = (i / segments) * Math.PI * 2 - Math.PI / 2;
          const x1 = inner * Math.cos(angle);
          const y1 = inner * Math.sin(angle);
          const x2 = outer * Math.cos(angle);
          const y2 = outer * Math.sin(angle);
          const active = i < activeSegments;

          return (
            <Line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={active ? activeColor : GAUGE_INACTIVE}
              strokeWidth={active ? 6 : 4}
              strokeLinecap="round"
              opacity={active ? 1 : 0.6}
            />
          );
        })}

        <Circle r={inner - 12} fill="#fff" />
        <SvgText
          y={-6}
          textAnchor="middle"
          fontSize={centerFontSize}
          fontWeight="700"
          fill="#111827">
          {displayPercent}%
        </SvgText>
        <SvgText y={16} textAnchor="middle" fontSize={labelFontSize} fill="#6B7280">
          {label}
        </SvgText>
      </G>
    </Svg>
  );
}
