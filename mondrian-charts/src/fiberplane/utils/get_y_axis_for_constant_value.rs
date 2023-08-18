use crate::types::Axis;

/// Returns the Y axis to display results if all results have the same value.
///
/// For values larger than 1 or smaller than -1, the results will be centered
/// along the Y axis. For values closer to zero, the zero value is kept at the
/// bottom (for zero and positive values) or top (for negative values) of the
/// axis.
pub(super) fn get_y_axis_for_constant_value(value: f64) -> Axis {
    let mut axis = if (-1. ..=1.).contains(&value) {
        if value >= 0. {
            Axis {
                min_value: 0.,
                max_value: value + 1.,
                tick_suggestions: None,
            }
        } else {
            Axis {
                min_value: value - 1.,
                max_value: 0.,
                tick_suggestions: None,
            }
        }
    } else {
        Axis {
            min_value: value - 1.,
            max_value: value + 1.,
            tick_suggestions: None,
        }
    };

    let mut tick_suggestions = vec![value];
    if axis.min_value != value {
        tick_suggestions.insert(0, axis.min_value);
    }
    if axis.max_value != value {
        tick_suggestions.push(axis.max_value);
    }

    axis.tick_suggestions = Some(tick_suggestions);
    axis
}

#[cfg(test)]
mod tests {
    use super::{get_y_axis_for_constant_value, Axis};

    #[test]
    fn test_get_y_axis_for_constant_value() {
        assert_eq!(
            get_y_axis_for_constant_value(-0.5),
            Axis {
                min_value: -1.5,
                max_value: 0.,
                tick_suggestions: Some(vec![-1.5, -0.5, 0.])
            }
        );

        assert_eq!(
            get_y_axis_for_constant_value(0.),
            Axis {
                min_value: 0.,
                max_value: 1.,
                tick_suggestions: Some(vec![0., 1.])
            }
        );

        assert_eq!(
            get_y_axis_for_constant_value(0.5),
            Axis {
                min_value: 0.,
                max_value: 1.5,
                tick_suggestions: Some(vec![0., 0.5, 1.5])
            }
        );

        assert_eq!(
            get_y_axis_for_constant_value(1.),
            Axis {
                min_value: 0.,
                max_value: 2.,
                tick_suggestions: Some(vec![0., 1., 2.])
            }
        );

        assert_eq!(
            get_y_axis_for_constant_value(1.5),
            Axis {
                min_value: 0.5,
                max_value: 2.5,
                tick_suggestions: Some(vec![0.5, 1.5, 2.5])
            }
        );
    }
}
