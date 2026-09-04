/**
 * Sizing helpers so charts fit inside their card instead of scrolling sideways.
 */

export const Y_AXIS_LABEL_WIDTH = 34;

/**
 * Room before the first and after the last point. Axis labels are centred on
 * their point and overflow their slot, so the ends need half a label of space
 * to stay inside the card.
 */
export const CHART_INITIAL_SPACING = 24;
export const CHART_END_SPACING = 24;

/** Widest x-axis label we can draw upright without labels touching. */
const MIN_LABEL_SLOT = 48;

/**
 * Keeps every nth label and blanks the rest, so the axis stays readable at any
 * point count without rotating text.
 */
export function thinLabels(labels: string[], plotWidth: number): string[] {
  if (labels.length === 0) return labels;

  const maxLabels = Math.max(Math.floor(plotWidth / MIN_LABEL_SLOT), 2);
  if (labels.length <= maxLabels) return labels;

  const step = Math.ceil((labels.length - 1) / (maxLabels - 1));
  return labels.map((label, index) => (index % step === 0 ? label : ''));
}

/**
 * Point spacing that keeps the whole line chart inside the plot width.
 */
export function fitLineSpacing(plotWidth: number, pointCount: number): number {
  if (pointCount <= 1) return plotWidth;
  const usable = plotWidth - CHART_INITIAL_SPACING - CHART_END_SPACING;
  return Math.max(usable / (pointCount - 1), 1);
}

/**
 * Splits the available plot width into bar + gap so all bars stay in view.
 */
export function fitBars(
  plotWidth: number,
  barCount: number,
): { barWidth: number; spacing: number } {
  const usable = Math.max(
    plotWidth - CHART_INITIAL_SPACING - CHART_END_SPACING,
    barCount * 6,
  );
  const slot = usable / Math.max(barCount, 1);
  const barWidth = Math.max(Math.min(Math.round(slot * 0.62), 26), 4);
  const spacing = Math.max(slot - barWidth, 2);
  return { barWidth, spacing };
}
