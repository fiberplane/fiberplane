// This is the space that's always there even if the padding is set to 0.
const FIXED_PADDING = 7;
// Minimum width for a bar
const MIN_BAR_WIDTH = 3;

export function calculateBandwidth(width: number, steps: number): number {
  return Math.max((width - FIXED_PADDING * (steps - 1)) / steps, MIN_BAR_WIDTH);
}
