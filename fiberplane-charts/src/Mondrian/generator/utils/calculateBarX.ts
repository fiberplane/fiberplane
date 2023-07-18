import { BAR_PADDING, BAR_PLUS_PADDING } from "../constants";

const HALF_PADDING = 0.5 * BAR_PADDING;

/**
 * Calculates the (left) X coordinate for a bar in a bar chart.
 *
 * `groupX` is the center coordinate for the bar group that contains all the
 * bars for a given bucket. `barWidth` is the width of an individual bar.
 *
 * `barIndex` and `numShapeLists` define the index of the bar within the group,
 * and how many bars may exist in the group in total, respectively.
 */
export function calculateBarX(
  groupX: number,
  barWidth: number,
  barIndex: number,
  numShapeLists: number,
): number {
  return (
    groupX +
    (barIndex - 0.5 * numShapeLists) * (barWidth * BAR_PLUS_PADDING) -
    barWidth * HALF_PADDING
  );
}
