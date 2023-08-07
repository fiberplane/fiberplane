use crate::types::Axis;

/// Returns the Y axis to display results if all results have the same value.
///
/// For values larger than 1 or smaller than -1, the results will be centered
/// along the Y axis. For values closer to zero, the zero value is kept at the
/// bottom (for zero and positive values) or top (for negative values) of the
/// axis.
pub(super) fn get_y_axis_for_constant_value(value: f64) -> Axis {
    let tick_suggestions = Some(vec![value]);

    if (-1. ..=1.).contains(&value) {
        if value >= 0. {
            Axis {
                min_value: 0.,
                max_value: value + 1.,
                tick_suggestions,
            }
        } else {
            Axis {
                min_value: value - 1.,
                max_value: 0.,
                tick_suggestions,
            }
        }
    } else {
        Axis {
            min_value: value - 1.,
            max_value: value + 1.,
            tick_suggestions,
        }
    }
}
