use super::utils::*;
use crate::fiberplane::{Metric, MinMax, Timeseries, TimeseriesSourceData};
use crate::types::{Axis, Line, MondrianChart, Point, Shape, ShapeList};
use std::convert::identity;

pub(crate) fn generate_line_chart_from_timeseries<'source>(
    input: TimeseriesSourceData<'source, '_, '_>,
) -> MondrianChart<&'source Timeseries, &'source Metric> {
    let buckets = create_metric_buckets(input.timeseries_data, |min_max, value| {
        min_max
            .map(|min_map: MinMax| min_map.extend_with_value(value))
            .unwrap_or_else(|| MinMax::from_value(value))
    });

    let mut x_axis = get_x_axis_from_time_range(&input.time_range);
    let mut y_axis = calculate_y_axis_range(&buckets, identity);

    for &value in input.additional_values {
        y_axis = y_axis.extend_with_value(value);
    }

    let interval = calculate_smallest_time_interval(&buckets);
    if let Some(interval) = interval {
        attach_suggestions_to_x_axis(&mut x_axis, &buckets, interval);
    }

    let shape_lists: Vec<_> = input
        .timeseries_data
        .iter()
        .map(|timeseries| ShapeList {
            shapes: if timeseries.visible {
                create_shapes(&timeseries.metrics, &x_axis, &y_axis, interval)
            } else {
                Vec::new()
            },
            source: *timeseries,
        })
        .collect();

    MondrianChart {
        shape_lists,
        x_axis,
        y_axis,
    }
}

fn create_shapes<'source>(
    metrics: &'source [Metric],
    x_axis: &Axis,
    y_axis: &Axis,
    interval: Option<f64>,
) -> Vec<Shape<&'source Metric>> {
    match metrics.len() {
        0 => Vec::new(),
        1 => {
            let metric = &metrics[0];
            if metric.value.is_nan() {
                Vec::new()
            } else {
                vec![Shape::Point(create_point_for_metric(
                    metric, x_axis, y_axis,
                ))]
            }
        }
        _ => {
            split_into_continuous_lines(metrics, interval)
                .into_iter()
                .map(|line| {
                    // If the line only containes one metric value, render it as a point
                    // Otherwise, render a line
                    if line.len() == 1 {
                        Shape::Point(create_point_for_metric(line[0], x_axis, y_axis))
                    } else {
                        Shape::Line(Line {
                            area_gradient_shown: None,
                            points: line
                                .into_iter()
                                .map(|metric| create_point_for_metric(metric, x_axis, y_axis))
                                .collect(),
                        })
                    }
                })
                .collect()
        }
    }
}

fn create_point_for_metric<'source>(
    metric: &'source Metric,
    x_axis: &Axis,
    y_axis: &Axis,
) -> Point<&'source Metric> {
    let time = get_time_from_timestamp(metric.time);

    Point {
        x: normalize_along_linear_axis(time, x_axis),
        y: normalize_along_linear_axis(metric.value, y_axis),
        source: metric,
    }
}
