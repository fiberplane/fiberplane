use crate::constants::BAR_PLUS_PADDING;
use crate::types::Axis;

/// Calculates the width of bars in bar charts.
pub(crate) fn calculate_bar_width(
    x_axis: &Axis,
    interval: Option<f64>,
    num_bars_per_group: usize,
) -> f64 {
    let num_groups = if let Some(interval) = interval {
        ((x_axis.max_value - x_axis.min_value) / interval).round() + 1.
    } else {
        1.
    };
    let num_bars = num_groups * num_bars_per_group as f64;
    1. / (num_bars * BAR_PLUS_PADDING)
}
