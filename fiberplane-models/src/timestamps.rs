#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use std::{
    fmt,
    ops::{Deref, Sub},
    str::FromStr,
    time::SystemTime,
};
use time::{
    ext::NumericalDuration, format_description::well_known::Rfc3339, Duration, OffsetDateTime,
};

/// A range in time from a given timestamp (inclusive) up to another timestamp
/// (exclusive).
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::timestamps")
)]
pub struct TimeRange {
    pub from: Timestamp,
    pub to: Timestamp,
}

impl TimeRange {
    /// Creates a new time range from a start timestamp (inclusive) to an end
    /// timestamp (exclusive).
    pub fn new(start: Timestamp, end: Timestamp) -> Self {
        Self {
            from: start,
            to: end,
        }
    }
}

impl From<NewTimeRange> for TimeRange {
    fn from(new_time_range: NewTimeRange) -> Self {
        match new_time_range {
            NewTimeRange::Absolute(time_range) => time_range,
            NewTimeRange::Relative(RelativeTimeRange { minutes }) => {
                let now = OffsetDateTime::now_utc();
                if minutes < 0 {
                    TimeRange {
                        from: (now + (minutes as i64).minutes()).into(),
                        to: now.into(),
                    }
                } else {
                    TimeRange {
                        from: now.into(),
                        to: (now + (minutes as i64).minutes()).into(),
                    }
                }
            }
        }
    }
}

#[derive(Clone, Copy, Debug, Deserialize, Eq, Ord, PartialEq, PartialOrd, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::timestamps")
)]
pub struct Timestamp(#[serde(with = "time::serde::rfc3339")] pub OffsetDateTime);

impl Timestamp {
    /// Parses an RFC 3339-formatted string into a timestamp.
    pub fn parse(string: &str) -> Result<Self, time::Error> {
        Ok(Self(OffsetDateTime::parse(string, &Rfc3339)?))
    }
}

impl FromStr for Timestamp {
    type Err = time::Error;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::parse(s)
    }
}

impl fmt::Display for Timestamp {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.0.format(&Rfc3339).map_err(|_| fmt::Error)?)
    }
}

impl From<OffsetDateTime> for Timestamp {
    fn from(time: OffsetDateTime) -> Self {
        Self(time)
    }
}

impl From<SystemTime> for Timestamp {
    fn from(time: SystemTime) -> Self {
        Self(OffsetDateTime::from(time))
    }
}

impl Sub<Timestamp> for Timestamp {
    type Output = Duration;

    fn sub(self, rhs: Timestamp) -> Self::Output {
        self.0 - rhs.0
    }
}

impl From<Timestamp> for OffsetDateTime {
    fn from(timestamp: Timestamp) -> Self {
        timestamp.0
    }
}

impl Deref for Timestamp {
    type Target = OffsetDateTime;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::timestamps")
)]
#[non_exhaustive]
#[serde(untagged)]
pub enum NewTimeRange {
    Absolute(TimeRange),
    Relative(RelativeTimeRange),
}

impl From<TimeRange> for NewTimeRange {
    fn from(time_range: TimeRange) -> Self {
        Self::Absolute(time_range)
    }
}

/// A relative time range specified in minutes.
///
/// A negative value means the time range starts at the given amount of
/// `minutes` of to *now*. A positive value (including zero) means the time
/// range starts now and ends `minutes` from now.
///
/// Relative time ranges are expanded to absolute time ranges upon instantiation
/// of a notebook.
#[derive(Clone, Copy, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::timestamps")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct RelativeTimeRange {
    pub minutes: i32,
}

impl RelativeTimeRange {
    pub fn from_minutes(minutes: i32) -> RelativeTimeRange {
        RelativeTimeRange { minutes }
    }
}
