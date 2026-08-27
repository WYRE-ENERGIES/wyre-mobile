import { WyreColors } from '@/constants/theme';

export type ScorecardChartSegment = {
  segments: { value: number; color: string }[];
};

const CHART_GRAY = '#F0F0F0';

export function buildDoughnutSegments(
  primary: number | null,
  total: number | null,
  color: string = WyreColors.purple,
): ScorecardChartSegment['segments'] {
  if (primary == null || total == null || total <= 0) {
    return [
      { value: 0.0001, color: CHART_GRAY },
      { value: 1, color: CHART_GRAY },
    ];
  }

  const used = Math.max(0, Math.min(primary, total));
  const remainder = Math.max(0, total - used);

  if (used === 0 && remainder === 0) {
    return [
      { value: 0.0001, color: CHART_GRAY },
      { value: 1, color: CHART_GRAY },
    ];
  }

  return [
    { value: used, color },
    { value: remainder || 0.0001, color: CHART_GRAY },
  ];
}
