use super::get_time_from_timestamp;
use crate::types::Buckets;

/// Calculates the smallest interval between any two timestamps present in the
/// given buckets.
///
/// Returns `None` if there are insufficient timestamps to calculate an
/// interval.
pub(crate) fn calculate_smallest_time_interval<T>(buckets: &Buckets<T>) -> Option<f64> {
    if buckets.len() < 2 {
        return None;
    }

    let mut timestamps: Vec<_> = buckets.keys().cloned().collect();
    timestamps.sort();

    let mut smallest_interval = f64::INFINITY;
    for i in 1..timestamps.len() {
        let interval =
            get_time_from_timestamp(timestamps[i]) - get_time_from_timestamp(timestamps[i - 1]);
        if interval < smallest_interval {
            smallest_interval = interval;
        }
    }

    Some(smallest_interval)
}
