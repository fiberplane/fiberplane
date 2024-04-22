use super::utils::*;
use crate::fiberplane::{Metric, StackedChartBuckets, Timeseries, TimeseriesSourceData};
use crate::types::{Area, AreaPoint, Axis, MondrianChart, Shape, ShapeList};

pub(crate) fn generate_stacked_line_chart_from_timeseries<'source>(
    input: TimeseriesSourceData<'source, '_, '_>,
) -> MondrianChart<&'source Timeseries, &'source Metric> {
    let BucketsAndAxes {
        mut buckets,
        is_percentage,
        mut x_axis,
        mut y_axis,
    } = calculate_buckets_and_axes_for_stacked_chart(&input);

    for &value in input.additional_values {
        y_axis = y_axis.extend_with_value(value);
    }

    let interval = calculate_smallest_time_interval(&buckets);
    if let Some(interval) = interval {
        attach_suggestions_to_x_axis(&mut x_axis, &buckets, interval);
    }

    let mut args = BarArgs {
        buckets: &mut buckets,
        is_percentage,
        x_axis: &x_axis,
        y_axis: &y_axis,
    };

    let shape_lists: Vec<_> = input
        .timeseries_data
        .iter()
        .map(|timeseries| ShapeList {
            shapes: if timeseries.visible {
                create_shapes(&timeseries.metrics, interval, &mut args)
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

struct BarArgs<'axes, 'buckets> {
    buckets: &'buckets mut StackedChartBuckets,
    is_percentage: bool,
    x_axis: &'axes Axis,
    y_axis: &'axes Axis,
}

fn create_shapes<'source>(
    metrics: &'source [Metric],
    interval: Option<f64>,
    args: &mut BarArgs,
) -> Vec<Shape<&'source Metric>> {
    split_into_continuous_lines(metrics, interval)
        .iter()
        .map(|line| {
            Shape::Area(Area {
                area_gradient_shown: None,
                points: line
                    .iter()
                    .filter_map(|metric| create_point_for_metric(metric, args))
                    .collect(),
            })
        })
        .collect()
}

fn create_point_for_metric<'source>(
    metric: &'source Metric,
    args: &mut BarArgs,
) -> Option<AreaPoint<&'source Metric>> {
    let bucket_value = args.buckets.get_mut(&metric.time)?;

    let time = get_time_from_timestamp(metric.time);
    let value = if args.is_percentage {
        metric.value / bucket_value.total
    } else {
        metric.value
    };

    let y_min = bucket_value.current_y;
    let y_max = y_min + normalize_along_linear_axis(value, args.y_axis);
    bucket_value.current_y = y_max;

    Some(AreaPoint {
        x: normalize_along_linear_axis(time, args.x_axis),
        y_min,
        y_max,
        source: metric,
    })
}
