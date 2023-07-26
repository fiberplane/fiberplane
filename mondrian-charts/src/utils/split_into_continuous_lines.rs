use super::get_time_from_timestamp;
use crate::types::Metric;

/// Takes an array of metrics and divides it into a lines of metrics without
/// gaps.
///
/// Any metric that has a `NaN` value, or that follows more than `1.5 * interval`
/// after the previous metric is considered to introduce a gap in the metrics.
pub(crate) fn split_into_continuous_lines(
    metrics: Vec<Metric>,
    interval: Option<f32>,
) -> Vec<Vec<Metric>> {
    let mut lines = Vec::new();
    let mut current_line = Vec::new();
    let mut previous_time: Option<f32> = None;

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
