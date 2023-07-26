use super::utils::*;
use crate::{
    types::{
        AbstractChart, Axis, Line, Metric, MinMax, Point, Shape, ShapeList, Timeseries,
        TimeseriesSourceData,
    },
    utils::get_time_from_timestamp,
};
use std::convert::identity;

pub(crate) fn generate_line_chart_from_timeseries(
    input: TimeseriesSourceData,
) -> AbstractChart<Timeseries, Metric> {
    let buckets = create_metric_buckets(input.timeseries_data.iter(), |min_max, value| {
        min_max
            .map(|min_map: MinMax| min_map.extend_with_value(value as f32))
            .unwrap_or_else(|| MinMax::from_value(value as f32))
    });

    let mut x_axis = get_x_axis_from_time_range(input.time_range);
    let y_axis = calculate_y_axis_range(buckets, identity);

    let interval = calculate_smallest_time_interval(buckets);
    if let Some(interval) = interval {
        attach_suggestions_to_x_axis(&mut x_axis, buckets, interval);
    }

    let shape_lists: Vec<_> = input
        .timeseries_data
        .into_iter()
        .map(|timeseries| ShapeList {
            shapes: if timeseries.visible {
                create_shapes(timeseries.metrics, x_axis, y_axis, interval)
            } else {
                Vec::new()
            },
            source: timeseries,
        })
        .collect();

    AbstractChart {
        shape_lists,
        x_axis,
        y_axis,
    }
}

fn create_shapes(
    metrics: Vec<Metric>,
    x_axis: Axis,
    y_axis: Axis,
    interval: Option<f32>,
) -> Vec<Shape<Metric>> {
    match metrics.len() {
        0 => Vec::new(),
        1 => {
            let metric = metrics[0];
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

fn create_point_for_metric(metric: Metric, x_axis: Axis, y_axis: Axis) -> Point<Metric> {
    let time = get_time_from_timestamp(metric.time);

    Point {
        x: normalize_along_linear_axis(time, x_axis),
        y: normalize_along_linear_axis(metric.value as f32, y_axis),
        source: metric,
    }
}
