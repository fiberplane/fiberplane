use super::get_time_from_timestamp;
use crate::types::Metric;

/// Takes an array of metrics and divides it into a lines of metrics without
/// gaps.
///
/// Any metric that has a `NaN` value, or that follows more than `1.5 * interval`
/// after the previous metric is considered to introduce a gap in the metrics.
pub(crate) fn split_into_continuous_lines(
    metrics: &[Metric],
    interval: Option<f64>,
) -> Vec<Vec<&Metric>> {
    let mut lines = Vec::new();
    let mut current_line = Vec::new();
    let mut previous_time: Option<f64> = None;

    for metric in metrics {
        if metric.value.is_nan() {
            if !current_line.is_empty() {
                lines.push(current_line);
                current_line = Vec::new();
            }

            continue;
        }

        let new_time = get_time_from_timestamp(metric.time);
        match (previous_time, interval) {
            (Some(previous_time), Some(interval)) if new_time - previous_time > 1.5 * interval => {
                if !current_line.is_empty() {
                    lines.push(current_line);
                }

                current_line = vec![metric];
            }
            _ => {
                current_line.push(metric);
            }
        }

        previous_time = Some(new_time);
    }

    if !current_line.is_empty() {
        lines.push(current_line);
    }

    lines
}

#[cfg(test)]
mod tests {
    use super::split_into_continuous_lines;
    use crate::types::{Metric, Timestamp};
    use std::str::FromStr;

    #[test]
    fn test_it_splits_metrics_that_are_spaced_too_far_apart() {
        assert_eq!(
            split_into_continuous_lines(
                &[get_metric(0, 10.), get_metric(1, 15.), get_metric(2, 20.)],
                Some(30_000.), // ms,
            ),
            vec![
                vec![&get_metric(0, 10.)],
                vec![&get_metric(1, 15.)],
                vec![&get_metric(2, 20.)]
            ]
        );
    }

    #[test]
    fn test_it_doesnt_split_when_the_metrics_are_close_to_one_another() {
        assert_eq!(
            split_into_continuous_lines(
                &[get_metric(0, 10.), get_metric(1, 15.), get_metric(2, 20.)],
                Some(300_000.), // ms,
            ),
            vec![vec![
                &get_metric(0, 10.),
                &get_metric(1, 15.),
                &get_metric(2, 20.)
            ]]
        );
    }

    #[test]
    fn test_it_handles_unevenly_spaced_metrics() {
        assert_eq!(
            split_into_continuous_lines(
                &[
                    get_metric(0, 10.),
                    get_metric(1, 15.),
                    get_metric(3, 20.),
                    get_metric(4, 25.)
                ],
                Some(60_000.), // ms,
            ),
            vec![
                vec![&get_metric(0, 10.), &get_metric(1, 15.)],
                vec![&get_metric(3, 20.), &get_metric(4, 25.)],
            ]
        );
    }

    #[test]
    fn test_it_doesnt_split_when_no_interval_is_given() {
        assert_eq!(
            split_into_continuous_lines(
                &[get_metric(0, 10.), get_metric(1, 15.), get_metric(2, 20.),],
                None
            ),
            vec![vec![
                &get_metric(0, 10.),
                &get_metric(1, 15.),
                &get_metric(2, 20.)
            ]]
        );
    }

    #[test]
    fn test_it_splits_metrics_when_it_finds_a_nan_value() {
        assert_eq!(
            split_into_continuous_lines(
                &[
                    get_metric(0, 10.),
                    get_metric(1, f64::NAN),
                    get_metric(2, 20.)
                ],
                Some(300000.), // ms,
            ),
            vec![vec![&get_metric(0, 10.)], vec![&get_metric(2, 20.)]]
        );
    }

    fn get_metric(minute: u8, value: f64) -> Metric {
        Metric::builder()
            .time(Timestamp::from_str(&format!("2023-07-18T16:{minute:02}:00.000Z")).unwrap())
            .value(value)
            .build()
    }
}
