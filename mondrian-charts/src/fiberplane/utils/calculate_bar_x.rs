use crate::constants::{BAR_PADDING, BAR_PLUS_PADDING};

const HALF_PADDING: f64 = 0.5 * BAR_PADDING;

/// Calculates the (left) X coordinate for a bar in a bar chart.
///
/// `group_x` is the center coordinate for the bar group that contains all the
/// bars for a given bucket. `bar_width` is the width of an individual bar.
///
/// `bar_index` and `num_shape_lists` define the index of the bar within the
/// group, and how many bars may exist in the group in total, respectively.
pub(crate) fn calculate_bar_x(
    group_x: f64,
    bar_width: f64,
    bar_index: usize,
    num_shape_lists: usize,
) -> f64 {
    group_x + (bar_index as f64 - 0.5 * num_shape_lists as f64) * (bar_width * BAR_PLUS_PADDING)
        - bar_width * HALF_PADDING
}
