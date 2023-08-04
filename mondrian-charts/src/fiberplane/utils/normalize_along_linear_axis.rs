use crate::types::Axis;

/// Takes an absolute value and normalizes it to a value between 0.0 and 1.0 for
/// the given axis.
pub(crate) fn normalize_along_linear_axis(value: f64, axis: &Axis) -> f64 {
    (value - axis.min_value) / (axis.max_value - axis.min_value)
}
