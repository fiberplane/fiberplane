use crate::Axis;
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Write};
use time::{
    format_description::{modifier, Component, FormatItem},
    OffsetDateTime,
};

#[derive(Clone, Copy, Default, Deserialize, Eq, PartialEq, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum FormatterKind {
    /// Formats a number of bytes.
    ///
    /// ## Examples
    ///
    /// `0.1B`, `10B`, `10kB`.
    Bytes,

    /// Formats a duration expressed in seconds.
    ///
    /// ## Examples
    ///
    /// `0.1s`, `10s`, `2h47`.
    Duration,

    /// Formats a value with an optional exponent component, also referred to as
    /// "E notation".
    ///
    /// ## Examples
    ///
    /// `0.1`, `10`, `1.0e4`.
    #[default]
    Exponent,

    /// Formats a percentage value.
    ///
    /// ## Examples
    ///
    /// `0.1%`, `10%`, `10000%`.
    Percentage,

    /// Formats a value using scientific notation.
    ///
    /// ## Examples
    ///
    /// `100m`, `10`, `10k`.
    Scientific,

    /// Formats a time stamp expressed in seconds since the UNIX epoch.
    ///
    /// For brevity, the formatter omits the most significant parts of the time
    /// that are constant across the axis.
    ///
    /// Currently, only UTC formatting is supported.
    ///
    /// ## Examples
    ///
    /// `Fri 13`, `17:15`, `57.200`
    Time,
}

pub trait TickFormatter {
    fn format(&self, value: f64) -> String;
}

pub fn get_formatter_for_axis(axis: &Axis, kind: FormatterKind) -> Box<dyn TickFormatter> {
    match kind {
        FormatterKind::Bytes => Box::new(BytesFormatter::for_axis(axis)),
        FormatterKind::Duration => Box::new(DurationFormatter::for_axis(axis)),
        FormatterKind::Exponent => Box::new(ExponentFormatter::new()),
        FormatterKind::Percentage => Box::new(PercentageFormatter::new()),
        FormatterKind::Scientific => Box::new(ScientificFormatter::for_axis(axis)),
        FormatterKind::Time => Box::new(TimeFormatter::for_axis(axis)),
    }
}

pub struct BytesFormatter(ScientificFormatter);

impl BytesFormatter {
    pub fn for_axis(axis: &Axis) -> Self {
        Self(ScientificFormatter {
            minimum_unit: ScientificUnit::None,
            largest_unit: ScientificUnit::for_value(axis.max_value),
        })
    }
}

impl TickFormatter for BytesFormatter {
    fn format(&self, value: f64) -> String {
        format!("{}B", self.0.format(value))
    }
}

pub struct DurationFormatter {
    largest_unit: DurationUnit,
}

impl DurationFormatter {
    pub fn for_axis(axis: &Axis) -> Self {
        Self {
            largest_unit: DurationUnit::for_value(axis.max_value),
        }
    }
}

impl TickFormatter for DurationFormatter {
    fn format(&self, value: f64) -> String {
        let mut unit = self.largest_unit;
        let mut value = value * unit.multiplier();
        while value.abs() < 1. {
            if let Some((amount, next_unit)) = unit.next_largest() {
                value *= amount;
                unit = next_unit;
            } else {
                break;
            }
        }

        if value.abs() >= 10. {
            format!("{value:.0}{unit}")
        } else if let Some((amount, next_unit)) = unit.next_largest() {
            let first = value.floor();
            let second = (value - first) * amount;
            format!("{first:.0}{unit}{second:.0}{next_unit}")
        } else {
            // unit must be seconds (or smaller)
            let scientific = ScientificFormatter {
                minimum_unit: ScientificUnit::Pico,
                largest_unit: ScientificUnit::None,
            };
            let mut formatted = scientific.format(value);
            formatted.push('s');
            formatted
        }
    }
}

pub struct ExponentFormatter;

impl ExponentFormatter {
    pub fn new() -> Self {
        Self
    }
}

impl TickFormatter for ExponentFormatter {
    fn format(&self, value: f64) -> String {
        let absolute_value = value.abs();
        if absolute_value >= 10000. {
            let mut value = value * 0.0001;
            let mut exponent = 4;
            while value.abs() > 10. {
                value *= 0.1;
                exponent += 1;
            }
            format!("{value:.1}e{exponent}")
        } else if absolute_value < f64::EPSILON {
            "0".to_owned()
        } else if absolute_value < 0.01 {
            let mut value = value * 1000.;
            let mut exponent = -3;
            while value.abs() < 1. {
                value *= 10.;
                exponent -= 1;
            }
            format!("{value:.1}e{exponent}")
        } else if absolute_value < 0.1 {
            format!("{value:.2}")
        } else if value == value.round() {
            format!("{value:.0}")
        } else {
            format!("{value:.1}")
        }
    }
}

pub struct PercentageFormatter;

impl PercentageFormatter {
    pub fn new() -> Self {
        Self
    }
}

impl TickFormatter for PercentageFormatter {
    fn format(&self, value: f64) -> String {
        let percentage_value = value * 100.;
        if percentage_value == percentage_value.round() {
            format!("{percentage_value:.0}%")
        } else {
            format!("{percentage_value:.1}%")
        }
    }
}

pub struct ScientificFormatter {
    minimum_unit: ScientificUnit,
    largest_unit: ScientificUnit,
}

impl ScientificFormatter {
    pub fn for_axis(axis: &Axis) -> Self {
        let largest_unit = ScientificUnit::for_value(axis.max_value);
        let mut minimum_unit = ScientificUnit::for_value(axis.min_value);

        // It just looks awkward if we go into too much detail on an axis that
        // also has large numbers.
        if largest_unit > ScientificUnit::None && minimum_unit < ScientificUnit::None {
            minimum_unit = ScientificUnit::None;
        }

        Self {
            minimum_unit,
            largest_unit,
        }
    }
}

impl TickFormatter for ScientificFormatter {
    fn format(&self, value: f64) -> String {
        let mut unit = self.largest_unit;
        let mut value = value * unit.multiplier();
        while value.abs() < 0.05 && unit > self.minimum_unit {
            if let Some(next_unit) = unit.next_largest() {
                unit = next_unit;
            } else {
                break;
            }

            value *= 1000.;
        }

        if value.abs() == 0. {
            "0".to_owned()
        } else if value >= 10. || value == value.round() {
            format!("{value:.0}{unit}") // avoid unnecessary `.0` suffix
        } else {
            format!("{value:.1}{unit}")
        }
    }
}

pub struct TimeFormatter {
    scale: TimeScale,
}

impl TimeFormatter {
    pub fn for_axis(axis: &Axis) -> Self {
        Self {
            scale: TimeScale::for_axis(axis),
        }
    }
}

impl TickFormatter for TimeFormatter {
    fn format(&self, value: f64) -> String {
        let Ok(timestamp) = OffsetDateTime::from_unix_timestamp_nanos((value * 1e9) as i128) else {
            return "-".to_owned();
        };

        timestamp
            .format(&self.scale.format_description())
            .unwrap_or_else(|_| "-".to_owned())
    }
}

#[derive(Clone, Copy, Debug, Eq, Ord, PartialEq, PartialOrd)]
enum DurationUnit {
    Days,
    Hours,
    Minutes,
    Seconds,
}

impl DurationUnit {
    /// Returns the most appropriate unit to use for formatting the given
    /// duration, without assuming any other context.
    fn for_value(value: f64) -> Self {
        if value >= 24. * 3600. {
            Self::Days
        } else if value >= 3600. {
            Self::Hours
        } else if value >= 60. {
            Self::Minutes
        } else {
            Self::Seconds
        }
    }

    /// The multiplier to apply to a duration if it is to be formatted with this
    /// unit.
    fn multiplier(&self) -> f64 {
        match self {
            Self::Days => 1. / (24. * 3600.),
            Self::Hours => 1. / 3600.,
            Self::Minutes => 1. / 60.,
            Self::Seconds => 1.,
        }
    }

    /// Returns the next largest unit smaller than this unit, as well as the
    /// amount of that unit that fit into this unit, if any.
    fn next_largest(&self) -> Option<(f64, Self)> {
        match self {
            Self::Days => Some((24., Self::Hours)),
            Self::Hours => Some((60., Self::Minutes)),
            Self::Minutes => Some((60., Self::Seconds)),
            Self::Seconds => None,
        }
    }
}

impl Display for DurationUnit {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Days => f.write_char('d'),
            Self::Hours => f.write_char('h'),
            Self::Minutes => f.write_char('m'),
            Self::Seconds => f.write_char('s'),
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, Ord, PartialEq, PartialOrd)]
enum ScientificUnit {
    Tera = 4,
    Giga = 3,
    Mega = 2,
    Kilo = 1,
    None = 0,
    Milli = -1,
    Micro = -2,
    Nano = -3,
    Pico = -4,
}

impl ScientificUnit {
    /// Returns the most appropriate unit to use for formatting the given
    /// value, without assuming any other context.
    fn for_value(value: f64) -> Self {
        if value >= 1e12 {
            Self::Tera
        } else if value >= 1e9 {
            Self::Giga
        } else if value >= 1e6 {
            Self::Mega
        } else if value >= 1e3 {
            Self::Kilo
        } else if value >= 1. {
            Self::None
        } else if value >= 1e-3 {
            Self::Milli
        } else if value >= 1e-6 {
            Self::Micro
        } else if value >= 1e-9 {
            Self::Nano
        } else {
            Self::Pico
        }
    }

    /// The multiplier to apply to a value if it is to be formatted with this
    /// unit.
    fn multiplier(&self) -> f64 {
        match self {
            Self::Tera => 1e-12,
            Self::Giga => 1e-9,
            Self::Mega => 1e-6,
            Self::Kilo => 1e-3,
            Self::None => 1.,
            Self::Milli => 1e3,
            Self::Micro => 1e6,
            Self::Nano => 1e9,
            Self::Pico => 1e12,
        }
    }

    /// Returns the next largest unit smaller than this unit, if any.
    fn next_largest(&self) -> Option<Self> {
        match self {
            Self::Tera => Some(Self::Giga),
            Self::Giga => Some(Self::Mega),
            Self::Mega => Some(Self::Kilo),
            Self::Kilo => Some(Self::None),
            Self::None => Some(Self::Milli),
            Self::Milli => Some(Self::Micro),
            Self::Micro => Some(Self::Nano),
            Self::Nano => Some(Self::Pico),
            Self::Pico => None,
        }
    }
}

impl Display for ScientificUnit {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Tera => f.write_char('T'),
            Self::Giga => f.write_char('G'),
            Self::Mega => f.write_char('M'),
            Self::Kilo => f.write_char('k'),
            Self::None => Ok(()),
            Self::Milli => f.write_char('m'),
            Self::Micro => f.write_char('μ'),
            Self::Nano => f.write_char('n'),
            Self::Pico => f.write_char('p'),
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, Ord, PartialEq, PartialOrd)]
enum TimeScale {
    DayInMonth,
    DayInWeek,
    Hours,
    Minutes,
    Seconds,
    Milliseconds,
}

impl TimeScale {
    fn for_axis(axis: &Axis) -> Self {
        let delta = (axis.max_value - axis.min_value).abs();
        if delta > 10. * 24. * 3600. {
            Self::DayInMonth
        } else if delta > 24. * 3600. {
            Self::DayInWeek
        } else if delta > 3600. {
            Self::Hours
        } else if delta > 60. {
            Self::Minutes
        } else if delta > 1. {
            Self::Seconds
        } else {
            Self::Milliseconds
        }
    }

    const fn format_description(&self) -> FormatItem {
        use modifier::*;

        const DAY: Day = {
            let mut day = Day::default();
            day.padding = Padding::None;
            day
        };

        const HOUR: Hour = {
            let mut hour = Hour::default();
            hour.padding = Padding::None;
            hour
        };

        const MINUTE_PADDED: Minute = Minute::default();

        const SECOND_PADDED: Second = Second::default();

        const SECOND: Second = {
            let mut second = Second::default();
            second.padding = Padding::None;
            second
        };

        const SUBSECOND: Subsecond = {
            let mut subsecond = Subsecond::default();
            subsecond.digits = SubsecondDigits::Three;
            subsecond
        };

        const WEEKDAY: Weekday = {
            let mut weekday = Weekday::default();
            weekday.repr = WeekdayRepr::Short;
            weekday
        };

        match self {
            TimeScale::DayInMonth => FormatItem::Compound(&[
                FormatItem::Component(Component::Weekday(WEEKDAY)),
                FormatItem::Literal(b" "),
                FormatItem::Component(Component::Day(DAY)),
            ]),
            TimeScale::DayInWeek => FormatItem::Compound(&[
                FormatItem::Component(Component::Weekday(WEEKDAY)),
                FormatItem::Literal(b" "),
                FormatItem::Component(Component::Hour(HOUR)),
                FormatItem::Literal(b"h"),
            ]),
            TimeScale::Hours => FormatItem::Compound(&[
                FormatItem::Component(Component::Hour(HOUR)),
                FormatItem::Literal(b":"),
                FormatItem::Component(Component::Minute(MINUTE_PADDED)),
            ]),
            TimeScale::Minutes => FormatItem::Compound(&[
                FormatItem::Component(Component::Hour(HOUR)),
                FormatItem::Literal(b":"),
                FormatItem::Component(Component::Minute(MINUTE_PADDED)),
                FormatItem::Literal(b":"),
                FormatItem::Component(Component::Second(SECOND_PADDED)),
            ]),
            TimeScale::Seconds => FormatItem::Compound(&[
                FormatItem::Component(Component::Second(SECOND)),
                FormatItem::Literal(b"."),
                FormatItem::Component(Component::Subsecond(SUBSECOND)),
            ]),
            TimeScale::Milliseconds => FormatItem::Compound(&[
                FormatItem::Literal(b"."),
                FormatItem::Component(Component::Subsecond(SUBSECOND)),
            ]),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bytes_formatter() {
        let axis = Axis {
            min_value: 0.,
            max_value: 123456789.,
            tick_suggestions: None,
        };
        let formatter = BytesFormatter::for_axis(&axis);
        assert_eq!(formatter.format(123456789.), "123MB");
        assert_eq!(formatter.format(12345678.), "12MB");
        assert_eq!(formatter.format(1234567.), "1.2MB");
        assert_eq!(formatter.format(123456.), "0.1MB");
        assert_eq!(formatter.format(12345.), "12kB");
        assert_eq!(formatter.format(1234.), "1.2kB");
        assert_eq!(formatter.format(123.), "0.1kB");
        assert_eq!(formatter.format(12.), "12B");
        assert_eq!(formatter.format(1.), "1B");
        assert_eq!(formatter.format(0.), "0B");
        assert_eq!(formatter.format(0.1), "0.1B");
        assert_eq!(formatter.format(0.01), "0.0B");

        assert_eq!(formatter.format(-1234567.), "-1.2MB");
    }

    #[test]
    fn test_duration_formatter() {
        let axis = Axis {
            min_value: 0.,
            max_value: 123456789.,
            tick_suggestions: None,
        };
        let formatter = DurationFormatter::for_axis(&axis);
        assert_eq!(formatter.format(123456789.), "1429d");
        assert_eq!(formatter.format(12345678.), "143d");
        assert_eq!(formatter.format(1234567.), "14d");
        assert_eq!(formatter.format(123456.), "1d10h");
        assert_eq!(formatter.format(12345.), "3h26m");
        assert_eq!(formatter.format(1234.), "21m");
        assert_eq!(formatter.format(123.), "2m3s");
        assert_eq!(formatter.format(12.), "12s");
        assert_eq!(formatter.format(1.), "1s");
        assert_eq!(formatter.format(0.), "0s");
        assert_eq!(formatter.format(0.1), "0.1s");
        assert_eq!(formatter.format(0.01), "10ms");

        assert_eq!(formatter.format(-1234567.), "-14d");

        let axis = Axis {
            min_value: 0.,
            max_value: 123.456789,
            tick_suggestions: None,
        };
        let formatter = ScientificFormatter::for_axis(&axis);
        assert_eq!(formatter.format(123.456789), "123");
        assert_eq!(formatter.format(12.3456789), "12");
        assert_eq!(formatter.format(1.23456789), "1.2");
        assert_eq!(formatter.format(0.12345678), "0.1");
        assert_eq!(formatter.format(0.01234567), "12m");
        assert_eq!(formatter.format(0.00123456), "1.2m");
        assert_eq!(formatter.format(0.00012345), "0.1m");
        assert_eq!(formatter.format(0.00001234), "12μ");
        assert_eq!(formatter.format(0.00000123), "1.2μ");
        assert_eq!(formatter.format(0.), "0");

        assert_eq!(formatter.format(-1.23456789), "-1.2");
    }

    #[test]
    fn test_exponent_formatter() {
        let formatter = ExponentFormatter::new();
        assert_eq!(formatter.format(123456789.), "1.2e8");
        assert_eq!(formatter.format(12345678.), "1.2e7");
        assert_eq!(formatter.format(1234567.), "1.2e6");
        assert_eq!(formatter.format(123456.), "1.2e5");
        assert_eq!(formatter.format(12345.), "1.2e4");
        assert_eq!(formatter.format(1234.), "1234");
        assert_eq!(formatter.format(123.), "123");
        assert_eq!(formatter.format(12.), "12");
        assert_eq!(formatter.format(1.), "1");
        assert_eq!(formatter.format(0.), "0");
        assert_eq!(formatter.format(0.12345678), "0.1");
        assert_eq!(formatter.format(0.01234567), "0.01");
        assert_eq!(formatter.format(0.00123456), "1.2e-3");
        assert_eq!(formatter.format(0.00012345), "1.2e-4");
        assert_eq!(formatter.format(0.00001234), "1.2e-5");
        assert_eq!(formatter.format(0.00000123), "1.2e-6");

        assert_eq!(formatter.format(-1234567.), "-1.2e6");
        assert_eq!(formatter.format(-1.23456789), "-1.2");
    }

    #[test]
    fn test_percentage_formatter() {
        let formatter = PercentageFormatter::new();
        assert_eq!(formatter.format(1.), "100%");
        assert_eq!(formatter.format(0.), "0%");

        assert_eq!(formatter.format(1234.56), "123456%");
        assert_eq!(formatter.format(123.45), "12345%");
        assert_eq!(formatter.format(12.34), "1234%");
        assert_eq!(formatter.format(1.23), "123%");

        assert_eq!(formatter.format(0.1234), "12.3%");
        assert_eq!(formatter.format(0.0123), "1.2%");
        assert_eq!(formatter.format(0.012), "1.2%");
        assert_eq!(formatter.format(0.01), "1%");
        assert_eq!(formatter.format(0.0012345678), "0.1%");
        assert_eq!(formatter.format(0.0001234567), "0.0%");
        assert_eq!(formatter.format(0.0000123456), "0.0%");

        assert_eq!(formatter.format(-12345.67), "-1234567%");
        assert_eq!(formatter.format(-0.0123456789), "-1.2%");
    }

    #[test]
    fn test_scientific_formatter() {
        let axis = Axis {
            min_value: 0.,
            max_value: 123456789.,
            tick_suggestions: None,
        };
        let formatter = ScientificFormatter::for_axis(&axis);
        assert_eq!(formatter.format(123456789.), "123M");
        assert_eq!(formatter.format(12345678.), "12M");
        assert_eq!(formatter.format(1234567.), "1.2M");
        assert_eq!(formatter.format(123456.), "0.1M");
        assert_eq!(formatter.format(12345.), "12k");
        assert_eq!(formatter.format(1234.), "1.2k");
        assert_eq!(formatter.format(123.), "0.1k");
        assert_eq!(formatter.format(12.), "12");
        assert_eq!(formatter.format(1.), "1");
        assert_eq!(formatter.format(0.), "0");
        assert_eq!(formatter.format(0.1), "0.1");
        assert_eq!(formatter.format(0.01), "0.0");

        assert_eq!(formatter.format(-1234567.), "-1.2M");

        let axis = Axis {
            min_value: 0.,
            max_value: 123.456789,
            tick_suggestions: None,
        };
        let formatter = ScientificFormatter::for_axis(&axis);
        assert_eq!(formatter.format(123.456789), "123");
        assert_eq!(formatter.format(12.3456789), "12");
        assert_eq!(formatter.format(1.23456789), "1.2");
        assert_eq!(formatter.format(0.12345678), "0.1");
        assert_eq!(formatter.format(0.01234567), "12m");
        assert_eq!(formatter.format(0.00123456), "1.2m");
        assert_eq!(formatter.format(0.00012345), "0.1m");
        assert_eq!(formatter.format(0.00001234), "12μ");
        assert_eq!(formatter.format(0.00000123), "1.2μ");
        assert_eq!(formatter.format(0.), "0");

        assert_eq!(formatter.format(-1.23456789), "-1.2");
    }

    #[test]
    fn test_time_formatter() {
        let axis = Axis {
            min_value: 1691496477.932,
            max_value: 1692446877.932,
            tick_suggestions: None,
        };
        let formatter = TimeFormatter::for_axis(&axis);
        assert_eq!(formatter.format(1691496477.932), "Tue 8");

        let axis = Axis {
            min_value: 1691496477.932,
            max_value: 1691928477.932,
            tick_suggestions: None,
        };
        let formatter = TimeFormatter::for_axis(&axis);
        assert_eq!(formatter.format(1691496477.932), "Tue 12h");

        let axis = Axis {
            min_value: 1691496477.932,
            max_value: 1691579277.932,
            tick_suggestions: None,
        };
        let formatter = TimeFormatter::for_axis(&axis);
        assert_eq!(formatter.format(1691496477.932), "12:07");

        let axis = Axis {
            min_value: 1691496477.932,
            max_value: 1691496837.932,
            tick_suggestions: None,
        };
        let formatter = TimeFormatter::for_axis(&axis);
        assert_eq!(formatter.format(1691496477.932), "12:07:57");

        let axis = Axis {
            min_value: 1691496477.932,
            max_value: 1691496489.932,
            tick_suggestions: None,
        };
        let formatter = TimeFormatter::for_axis(&axis);
        assert_eq!(formatter.format(1691496477.932), "57.932");

        let axis = Axis {
            min_value: 1691496477.932,
            max_value: 1691496478.932,
            tick_suggestions: None,
        };
        let formatter = TimeFormatter::for_axis(&axis);
        assert_eq!(formatter.format(1691496477.932), ".932");
    }
}
