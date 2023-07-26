use super::utils::*;
use crate::types::{
    AbstractChart, Area, AreaPoint, Axis, Metric, Shape, ShapeList, StackedChartBuckets,
    Timeseries, TimeseriesSourceData,
};

pub(crate) fn generate_stacked_line_chart_from_timeseries(
    input: TimeseriesSourceData,
) -> AbstractChart<Timeseries, Metric> {
    let buckets_and_axes = calculate_buckets_and_axes_for_stacked_chart(input);
    let BucketsAndAxes {
        buckets,
        mut x_axis,
        y_axis,
        ..
    } = buckets_and_axes;

    let interval = calculate_smallest_time_interval(buckets);
    if let Some(interval) = interval {
        attach_suggestions_to_x_axis(&mut x_axis, buckets, interval);
    }

    let shape_lists: Vec<_> = input
        .timeseries_data
        .into_iter()
        .map(|timeseries| ShapeList {
            shapes: if timeseries.visible {
                create_shapes(timeseries.metrics, buckets_and_axes, interval)
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
    buckets_and_axes: BucketsAndAxes,
    interval: Option<f32>,
) -> Vec<Shape<Metric>> {
    let BucketsAndAxes {
        mut buckets,
        is_percentage,
        x_axis,
        y_axis,
    } = buckets_and_axes;

    let args = BarArgs {
        buckets: &mut buckets,
        is_percentage,
        x_axis,
        y_axis,
    };

    split_into_continuous_lines(metrics, interval)
        .into_iter()
        .map(|line| {
            Shape::Area(Area {
                points: line
                    .into_iter()
                    .filter_map(|metric| create_point_for_metric(metric, args))
                    .collect(),
            })
        })
        .collect()
}

struct BarArgs<'a> {
    buckets: &'a mut StackedChartBuckets,
    is_percentage: bool,
    x_axis: Axis,
    y_axis: Axis,
}

fn create_point_for_metric(metric: Metric, args: BarArgs) -> Option<AreaPoint<Metric>> {
    let Some(bucket_value) = args.buckets.get_mut(&metric.time) else {
        return None;
    };

    let time = get_time_from_timestamp(metric.time);
    let value = if args.is_percentage {
        metric.value as f32 / bucket_value.total
    } else {
        metric.value as f32
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
