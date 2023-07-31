use super::get_y_axis_for_constant_value;
use crate::types::{Axis, Buckets, MinMax};

/// Detects the range to display along the Y axis by looking at all the totals
/// inside the buckets.
///
/// This function is used for stacked charts. When rendering a normal chart, use
/// [`super::calculate_y_axis_range()`] instead.
pub(super) fn calculate_stacked_y_axis_range<T: Clone>(
    buckets: &Buckets<T>,
    get_total_value: impl Fn(T) -> f64,
) -> Axis {
    if buckets.is_empty() {
        return get_y_axis_for_constant_value(0.);
    }

    let mut min_max = MinMax::from_value(0.);
    for value in buckets.values().cloned() {
        min_max = min_max.extend_with_value(get_total_value(value));
    }

    let MinMax(min_value, max_value) = min_max;
    if min_value == max_value {
        return get_y_axis_for_constant_value(min_value);
    }

    Axis {
        min_value,
        max_value,
        ..Default::default()
    }
}
