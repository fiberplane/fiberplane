use crate::Axis;
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Write};

#[derive(Clone, Copy, Default, Deserialize, Eq, PartialEq, Serialize)]
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

    /// Formats a time stamp expressed in milliseconds since the EPOCH.
    ///
    /// Separators used between time components are based on ISO 8601. For
    /// brevity, the formatter omits the most significant parts of the time that
    /// are constant across the axis.
    ///
    /// ## Examples
    ///
    /// `08-07`, `17:15`, `57.200`
    Time,

    /// Formats a value with an optional exponent component, also referred to as
    /// "E notation".
    ///
    /// ## Examples
    ///
    /// `0.1`, `10`, `10e3`.
    #[default]
    Value,
}

pub trait TickFormatter {
    fn format(&self, value: f64) -> String;
}

pub fn get_formatter_for_axis(axis: &Axis, kind: FormatterKind) -> Box<dyn TickFormatter> {
    match kind {
        FormatterKind::Bytes => get_bytes_formatter_for_axis(axis),
        FormatterKind::Duration => get_duration_formatter_for_axis(axis),
        FormatterKind::Percentage => get_percentage_formatter_for_axis(axis),
        FormatterKind::Scientific => get_scientific_formatter_for_axis(axis),
        FormatterKind::Time => get_time_formatter_for_axis(axis),
        FormatterKind::Value => get_value_formatter_for_axis(axis),
    }
}

pub fn get_bytes_formatter_for_axis(axis: &Axis) -> Box<dyn TickFormatter> {
    Box::new(BytesFormatter(ScientificFormatter {
        minimum_suffix: ScientificSuffix::None,
        largest_suffix: ScientificSuffix::for_number(axis.max_value),
    }))
}

pub fn get_duration_formatter_for_axis(axis: &Axis) -> Box<dyn TickFormatter> {
    Box::new(DurationFormatter {
        largest_suffix: DurationSuffix::for_number(axis.max_value),
    })
}

pub fn get_percentage_formatter_for_axis(axis: &Axis) -> Box<dyn TickFormatter> {
    Box::new(PercentageFormatter)
}

pub fn get_scientific_formatter_for_axis(axis: &Axis) -> Box<dyn TickFormatter> {
    Box::new(ScientificFormatter {
        minimum_suffix: ScientificSuffix::Pico,
        largest_suffix: ScientificSuffix::for_number(axis.max_value),
    })
}

pub fn get_time_formatter_for_axis(axis: &Axis) -> Box<dyn TickFormatter> {
    todo!()
}

pub fn get_value_formatter_for_axis(axis: &Axis) -> Box<dyn TickFormatter> {
    Box::new(ValueFormatter)
}

pub struct BytesFormatter(ScientificFormatter);

impl TickFormatter for BytesFormatter {
    fn format(&self, value: f64) -> String {
        format!("{}B", self.0.format(value))
    }
}

pub struct DurationFormatter {
    largest_suffix: DurationSuffix,
}

impl TickFormatter for DurationFormatter {
    fn format(&self, value: f64) -> String {
        let mut suffix = self.largest_suffix;
        let mut value = value / suffix.divisor();
        while value.abs() < 1. {
            if let Some((amount, next_suffix)) = suffix.next_units() {
                value *= amount;
                suffix = next_suffix;
            } else {
                break;
            }
        }

        if let Some((amount, next_suffix)) = suffix.next_units() {
            let first = value.floor();
            let second = (value - first) * amount;
            format!("{first:.0}{suffix}{second:.0}{next_suffix}")
        } else {
            // suffix must be seconds (or smaller)
            let scientific = ScientificFormatter {
                minimum_suffix: ScientificSuffix::Pico,
                largest_suffix: ScientificSuffix::None,
            };
            let mut formatted = scientific.format(value);
            formatted.push('s');
            formatted
        }
    }
}

pub struct PercentageFormatter;

impl TickFormatter for PercentageFormatter {
    fn format(&self, value: f64) -> String {
        format!("{value:.1}%")
    }
}

pub struct ScientificFormatter {
    minimum_suffix: ScientificSuffix,
    largest_suffix: ScientificSuffix,
}

impl TickFormatter for ScientificFormatter {
    fn format(&self, value: f64) -> String {
        let mut suffix = self.largest_suffix;
        let mut value = value / suffix.divisor();
        while value.abs() < 0.05 && suffix > self.minimum_suffix {
            if let Some(next_suffix) = suffix.next_largest() {
                suffix = next_suffix;
            } else {
                break;
            }

            value *= 1000.;
        }

        if suffix == ScientificSuffix::None && value == value.round() {
            value.to_string() // avoid unnecessary `.0` suffix
        } else {
            format!("{value:.1}{suffix}")
        }
    }
}

pub struct ValueFormatter;

impl TickFormatter for ValueFormatter {
    fn format(&self, value: f64) -> String {
        if value.abs() > 1000. {
            let mut value = value * 0.001;
            let mut exponent = 3;
            while value > 10. {
                value *= 0.1;
                exponent += 1;
            }
            format!("{value:.1}e{exponent}")
        } else if value.abs() < 0.1 {
            let mut value = value * 100.;
            let mut exponent = -2;
            while value < 10. {
                value *= 10.;
                exponent -= 1;
            }
            format!("{value:.1}e{exponent}")
        } else {
            format!("{value:.1}")
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, Ord, PartialEq, PartialOrd)]
enum DurationSuffix {
    Days,
    Hours,
    Minutes,
    Seconds,
}

impl DurationSuffix {
    pub fn divisor(&self) -> f64 {
        match self {
            DurationSuffix::Days => 24. * 3600.,
            DurationSuffix::Hours => 3600.,
            DurationSuffix::Minutes => 60.,
            DurationSuffix::Seconds => 1.,
        }
    }

    pub fn for_number(number: f64) -> Self {
        if number >= 24. * 3600. {
            DurationSuffix::Days
        } else if number >= 3600. {
            DurationSuffix::Hours
        } else if number >= 60. {
            DurationSuffix::Minutes
        } else {
            DurationSuffix::Seconds
        }
    }

    pub fn next_units(&self) -> Option<(f64, Self)> {
        match self {
            DurationSuffix::Days => Some((24., DurationSuffix::Hours)),
            DurationSuffix::Hours => Some((60., DurationSuffix::Minutes)),
            DurationSuffix::Minutes => Some((60., DurationSuffix::Seconds)),
            DurationSuffix::Seconds => None,
        }
    }
}

impl Display for DurationSuffix {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DurationSuffix::Days => f.write_char('d'),
            DurationSuffix::Hours => f.write_char('h'),
            DurationSuffix::Minutes => f.write_char('m'),
            DurationSuffix::Seconds => f.write_char('s'),
        }
    }
}

#[derive(Clone, Copy, Debug, Eq, Ord, PartialEq, PartialOrd)]
enum ScientificSuffix {
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

impl ScientificSuffix {
    pub fn divisor(&self) -> f64 {
        match self {
            ScientificSuffix::Tera => 1e12,
            ScientificSuffix::Giga => 1e9,
            ScientificSuffix::Mega => 1e6,
            ScientificSuffix::Kilo => 1e3,
            ScientificSuffix::None => 1.,
            ScientificSuffix::Milli => 1e-3,
            ScientificSuffix::Micro => 1e-6,
            ScientificSuffix::Nano => 1e-9,
            ScientificSuffix::Pico => 1e-12,
        }
    }

    pub fn for_number(number: f64) -> Self {
        if number >= 1e12 {
            ScientificSuffix::Tera
        } else if number >= 1e9 {
            ScientificSuffix::Giga
        } else if number >= 1e6 {
            ScientificSuffix::Mega
        } else if number >= 1e3 {
            ScientificSuffix::Kilo
        } else if number >= 0. {
            ScientificSuffix::None
        } else if number >= 1e-3 {
            ScientificSuffix::Milli
        } else if number >= 1e-6 {
            ScientificSuffix::Micro
        } else if number >= 1e-9 {
            ScientificSuffix::Nano
        } else {
            ScientificSuffix::Pico
        }
    }

    pub fn next_largest(&self) -> Option<Self> {
        match self {
            ScientificSuffix::Tera => Some(ScientificSuffix::Giga),
            ScientificSuffix::Giga => Some(ScientificSuffix::Mega),
            ScientificSuffix::Mega => Some(ScientificSuffix::Kilo),
            ScientificSuffix::Kilo => Some(ScientificSuffix::None),
            ScientificSuffix::None => Some(ScientificSuffix::Milli),
            ScientificSuffix::Milli => Some(ScientificSuffix::Micro),
            ScientificSuffix::Micro => Some(ScientificSuffix::Nano),
            ScientificSuffix::Nano => Some(ScientificSuffix::Pico),
            ScientificSuffix::Pico => None,
        }
    }
}

impl Display for ScientificSuffix {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ScientificSuffix::Tera => f.write_char('T'),
            ScientificSuffix::Giga => f.write_char('G'),
            ScientificSuffix::Mega => f.write_char('M'),
            ScientificSuffix::Kilo => f.write_char('k'),
            ScientificSuffix::None => Ok(()),
            ScientificSuffix::Milli => f.write_char('m'),
            ScientificSuffix::Micro => f.write_char('μ'),
            ScientificSuffix::Nano => f.write_char('n'),
            ScientificSuffix::Pico => f.write_char('p'),
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
        let formatter = get_bytes_formatter_for_axis(&axis);
        assert_eq!(formatter.format(123456789.), "123.5MB");
        assert_eq!(formatter.format(12345678.), "12.3MB");
        assert_eq!(formatter.format(1234567.), "1.2MB");
        assert_eq!(formatter.format(123456.), "0.1MB");
        assert_eq!(formatter.format(12345.), "12.3kB");
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
    fn test_scientific_formatter() {
        let axis = Axis {
            min_value: 0.,
            max_value: 123456789.,
            tick_suggestions: None,
        };
        let formatter = get_scientific_formatter_for_axis(&axis);
        assert_eq!(formatter.format(123456789.), "123.5M");
        assert_eq!(formatter.format(12345678.), "12.3M");
        assert_eq!(formatter.format(1234567.), "1.2M");
        assert_eq!(formatter.format(123456.), "0.1M");
        assert_eq!(formatter.format(12345.), "12.3k");
        assert_eq!(formatter.format(1234.), "1.2k");
        assert_eq!(formatter.format(123.), "0.1k");
        assert_eq!(formatter.format(12.), "12");
        assert_eq!(formatter.format(1.), "1");
        assert_eq!(formatter.format(0.), "0");
        assert_eq!(formatter.format(0.1), "0.1");
        assert_eq!(formatter.format(0.01), "10m");

        assert_eq!(formatter.format(-1234567.), "-1.2M");
    }
}
