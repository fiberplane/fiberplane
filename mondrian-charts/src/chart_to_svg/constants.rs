// Dimensions of the chart
pub(super) const MARGIN_LEFT: u16 = 38;
pub(super) const MARGIN_TOP: u16 = 0;
pub(super) const MARGIN_RIGHT: u16 = 0;
pub(super) const MARGIN_BOTTOM: u16 = 20;

// Dimensions of points on the chart
pub(super) const POINT_RADIUS: u16 = 1;
pub(super) const POINT_RADIUS_FOCUSED: u16 = 2;

// If a point is directly on the edge of the chart, it can be cut off.
// This overflow margin ensures that the point is still visible.
pub(super) const CHART_SHAPE_OVERFLOW_MARGIN: u16 = POINT_RADIUS_FOCUSED;

pub(super) const TICK_FONT_FAMILY: &str = "Inter";
pub(super) const TICK_FONT_SIZE: u16 = 10;
pub(super) const TICK_FONT_WEIGHT: u16 = 400;
pub(super) const TICK_LABEL_OFFSET: u16 = 8;
