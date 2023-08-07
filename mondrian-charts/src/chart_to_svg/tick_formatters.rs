use crate::Axis;
use serde::{Deserialize, Serialize};
use std::fmt::{Display, Write};

#[derive(Clone, Copy, Default, Deserialize, Eq, PartialEq, Serialize)]
pub enum FormatterKind {
    /// Formats a number of bytes.
    ///
    /// ## Examples
    ///
    /// `0.1B`, `10B`, `10MB`.
    Bytes,

    /// Formats a duration expressed in seconds.
    ///
    /// ## Examples
    ///
    /// `0.1s`, `10s`, `2h47m`.
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

pub fn get_formatter_for_axis(axis: &Axis, kind: FormatterKind) -> impl Fn(f64) -> String {
    match kind {
        FormatterKind::Bytes => get_bytes_formatter_for_axis(axis),
        FormatterKind::Duration => get_duration_formatter_for_axis(axis),
        FormatterKind::Percentage => get_percentage_formatter_for_axis(axis),
        FormatterKind::Scientific => get_scientific_formatter_for_axis(axis),
        FormatterKind::Time => get_time_formatter_for_axis(axis),
        FormatterKind::Value => get_value_formatter_for_axis(axis),
    }
}

pub fn get_bytes_formatter_for_axis(axis: &Axis) -> impl Fn(f64) -> String {}

pub fn get_duration_formatter_for_axis(axis: &Axis) -> impl Fn(f64) -> String {}

pub fn get_percentage_formatter_for_axis(axis: &Axis) -> impl Fn(f64) -> String {}

pub fn get_scientific_formatter_for_axis(axis: &Axis) -> impl Fn(f64) -> String {}

pub fn get_time_formatter_for_axis(axis: &Axis) -> impl Fn(f64) -> String {}

pub fn get_value_formatter_for_axis(axis: &Axis) -> impl Fn(f64) -> String {}

enum Prefix {
    Tera,
    Giga,
    Mega,
    Kilo,
    None,
    Milli,
    Micro,
    Nano,
    Pico,
}

impl Prefix {
    pub fn divisor(&self) -> f64 {
        match self {
            Prefix::Tera => 1e12,
            Prefix::Giga => 1e9,
            Prefix::Mega => 1e6,
            Prefix::Kilo => 1e3,
            Prefix::None => 0.,
            Prefix::Milli => 1e-3,
            Prefix::Micro => 1e-6,
            Prefix::Nano => 1e-9,
            Prefix::Pico => 1e-12,
        }
    }

    pub fn for_number(number: f64) -> Self {
        if number >= 1e12 {
            Prefix::Tera
        } else if number >= 1e9 {
            Prefix::Giga
        } else if number >= 1e6 {
            Prefix::Mega
        } else if number >= 1e3 {
            Prefix::Kilo
        } else if number >= 0. {
            Prefix::None
        } else if number >= 1e-3 {
            Prefix::Milli
        } else if number >= 1e-6 {
            Prefix::Micro
        } else if number >= 1e-9 {
            Prefix::Nano
        } else {
            Prefix::Pico
        }
    }
}

impl Display for Prefix {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Prefix::Tera => f.write_char('T'),
            Prefix::Giga => f.write_char('G'),
            Prefix::Mega => f.write_char('M'),
            Prefix::Kilo => f.write_char('k'),
            Prefix::None => Ok(()),
            Prefix::Milli => f.write_char('m'),
            Prefix::Micro => f.write_char('μ'),
            Prefix::Nano => f.write_char('n'),
            Prefix::Pico => f.write_char('p'),
        }
    }
}

trait TickFormatter {
    fn format(value: f64) -> String;
}

pub struct ValueFormatter {
    max_value: f64,
}

impl TickFormatter for ValueFormatter {
    fn format(value: f64) -> String {}
}

pub fn format_duration(value: f64) -> String {}

pub fn format_percentage(value: f64) -> String {}

pub fn format_time(value: f64) -> String {}

pub fn format_scientific_value(value: f64) -> String {}

pub fn format_value(value: f64) -> String {}
