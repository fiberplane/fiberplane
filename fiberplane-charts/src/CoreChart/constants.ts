// Dimensions of the chart
export const HEIGHT = 275;
export const MARGINS = { top: 0, bottom: 20, left: 38, right: 0 };

// Dimensions of points on the chart
export const POINT_RADIUS = 1;
export const POINT_RADIUS_FOCUSED = 2;

// If a point is directly on the edge of the chart, it can be cut off.
// This overflow margin ensures that the point is still visible.
export const CHART_SHAPE_OVERFLOW_MARGIN = POINT_RADIUS_FOCUSED;
