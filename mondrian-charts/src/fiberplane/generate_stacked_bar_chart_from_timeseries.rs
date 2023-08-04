use super::utils::*;
use crate::fiberplane::{Metric, StackedChartBuckets, Timeseries, TimeseriesSourceData};
use crate::types::{Axis, MondrianChart, Rectangle, Shape, ShapeList};

pub(crate) fn generate_stacked_bar_chart_from_timeseries<'source>(
    input: TimeseriesSourceData<'source, '_>,
) -> MondrianChart<&'source Timeseries, &'source Metric> {
    let BucketsAndAxes {
        mut buckets,
        is_percentage,
        mut x_axis,
        y_axis,
    } = calculate_buckets_and_axes_for_stacked_chart(&input);

    let interval = calculate_smallest_time_interval(&buckets);
    if let Some(interval) = interval {
        x_axis = x_axis.extend_with_interval(interval);
        attach_suggestions_to_x_axis(&mut x_axis, &buckets, interval);
    }

    let mut bar_args = BarArgs {
        bar_width: calculate_bar_width(&x_axis, interval, 1),
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
                timeseries
                    .metrics
                    .iter()
                    .filter_map(|metric| create_bar_shape(metric, &mut bar_args))
                    .collect()
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
    bar_width: f64,
    buckets: &'buckets mut StackedChartBuckets,
    is_percentage: bool,
    x_axis: &'axes Axis,
    y_axis: &'axes Axis,
}

fn create_bar_shape<'source>(
    metric: &'source Metric,
    args: &mut BarArgs,
) -> Option<Shape<&'source Metric>> {
    if metric.value.is_nan() {
        return None;
    };

    let Some(bucket_value) = args.buckets.get_mut(&metric.time) else {
        return None;
    };

    let time = get_time_from_timestamp(metric.time);
    let value = if args.is_percentage {
        metric.value / bucket_value.total
    } else {
        metric.value
    };

    let x = normalize_along_linear_axis(time, args.x_axis) - 0.5 * args.bar_width;
    let y = bucket_value.current_y;

    let height = normalize_along_linear_axis(value, args.y_axis);
    bucket_value.current_y += height;

    Some(Shape::Rectangle(Rectangle {
        x,
        y,
        width: args.bar_width,
        height,
        source: metric,
    }))
}
