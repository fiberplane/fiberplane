use super::get_time_from_timestamp;
use crate::types::{Axis, Buckets};

/// Adds suggestions to the axis based on the position of the first bucket and
/// the interval between buckets.
pub(crate) fn attach_suggestions_to_x_axis<T>(
    x_axis: &mut Axis,
    buckets: &Buckets<T>,
    interval: f64,
) {
    if interval <= 0. {
        return;
    }

    let Some(mut suggestion) = get_first_bucket_time(buckets) else {
        return;
    };

    let mut suggestions = Vec::new();

    while suggestion < x_axis.max_value {
        if suggestion >= x_axis.min_value {
            suggestions.push(suggestion);
        }

        suggestion += interval;
    }

    x_axis.tick_suggestions = Some(suggestions);
}

fn get_first_bucket_time<T>(buckets: &Buckets<T>) -> Option<f64> {
    let mut first_bucket_timestamp = None;
    for timestamp in buckets.keys() {
        if first_bucket_timestamp
            .map(|first_bucket_timestamp| timestamp < first_bucket_timestamp)
            .unwrap_or(true)
        {
            first_bucket_timestamp = Some(timestamp);
        }
    }

    first_bucket_timestamp.cloned().map(get_time_from_timestamp)
}
