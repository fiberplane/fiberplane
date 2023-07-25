import { POINT_RADIUS_FOCUSED } from "./ChartShape";

// Dimensions.
export const HEIGHT = 275;
export const MARGINS = { top: 0, bottom: 20, left: 38, right: 0 };
// If a point is directly on the edge of the chart, it can be cut off.
// The overflow margin ensures that the point is still visible.
export const CHART_SHAPE_OVERFLOW_MARGIN = POINT_RADIUS_FOCUSED;
