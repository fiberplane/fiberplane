use crate::fiberplane::Timestamp;

/// Converts a [Timestamp] to a time value expressed in seconds since the UNIX
/// epoch.
pub(crate) fn get_time_from_timestamp(timestamp: Timestamp) -> f64 {
    timestamp.unix_timestamp() as f64
}
