use super::get_y_axis_for_constant_value;
use crate::fiberplane::{Buckets, MinMax};
use crate::types::Axis;

/// Detects the range to display along the Y axis by looking at all the min-max
/// values inside the buckets.
///
/// When rendering a stacked chart, use
/// [`super::calculate_stacked_y_axis_range()`] instead.
pub(crate) fn calculate_y_axis_range<T: Clone>(
    buckets: &Buckets<T>,
    get_min_max: impl Fn(T) -> MinMax,
) -> Axis {
    let Some(min_max) = get_buckets_min_max(buckets, get_min_max) else {
        return get_y_axis_for_constant_value(0.);
    };

    let MinMax(mut min_value, mut max_value) = min_max;

    if min_value == max_value {
        return get_y_axis_for_constant_value(min_value);
    }

    let distance = max_value - min_value;
    let margin = 0.05 * distance;

    if min_value < 0. || min_value >= margin {
        min_value -= margin;
    } else {
        min_value = 0.;
    }

    if max_value > 0. || max_value <= -margin {
        max_value += margin;
    } else {
        max_value = 0.;
    }

    Axis {
        min_value,
        max_value,
        tick_suggestions: None,
    }
}

fn get_buckets_min_max<T: Clone>(
    buckets: &Buckets<T>,
    get_min_max: impl Fn(T) -> MinMax,
) -> Option<MinMax> {
    let mut min_max: Option<MinMax> = None;

    for value in buckets.values() {
        let bucket_min_max = get_min_max(value.clone());
        min_max = Some(if let Some(min_max) = min_max {
            min_max.extend_with_other(bucket_min_max)
        } else {
            bucket_min_max
        });
    }

    min_max
}
