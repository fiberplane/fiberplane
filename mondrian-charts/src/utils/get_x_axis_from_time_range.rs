use super::get_time_from_timestamp;
use crate::types::{Axis, TimeRange};

/// Returns the X axis to display results for the given time range.
pub(crate) fn get_x_axis_from_time_range(time_range: &TimeRange) -> Axis {
    Axis {
        min_value: get_time_from_timestamp(time_range.from),
        max_value: get_time_from_timestamp(time_range.to),
        ..Default::default()
    }
}
