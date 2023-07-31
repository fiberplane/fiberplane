use crate::types::Timestamp;

/// Converts an [Timestamp] to a time value expressed in milliseconds.
pub(crate) fn get_time_from_timestamp(timestamp: Timestamp) -> f64 {
    timestamp.unix_timestamp() as f64 * 1000.
}
