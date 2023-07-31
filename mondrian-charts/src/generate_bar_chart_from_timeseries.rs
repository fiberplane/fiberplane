use super::utils::*;
use crate::types::{
    AbstractChart, Axis, Metric, MinMax, Rectangle, Shape, ShapeList, Timeseries,
    TimeseriesSourceData,
};
use std::convert::identity;

pub(crate) fn generate_bar_chart_from_timeseries<'source>(
    input: TimeseriesSourceData<'source, '_>,
) -> AbstractChart<&'source Timeseries, &'source Metric> {
    let visible_timeseries_data: Vec<_> = input
        .timeseries_data
        .iter()
        .filter(|timeseries| timeseries.visible)
        .cloned()
        .collect();

    let buckets = create_metric_buckets(&visible_timeseries_data, |min_max, value| {
        min_max
            .map(|min_max: MinMax| min_max.extend_with_value(value))
            .unwrap_or_else(|| MinMax::from_value(value))
    });

    let mut x_axis = get_x_axis_from_time_range(&input.time_range);
    let y_axis = calculate_y_axis_range(&buckets, identity);

    let num_shape_lists = visible_timeseries_data.len();

    let interval = calculate_smallest_time_interval(&buckets);
    if let Some(interval) = interval {
        x_axis = x_axis.extend_with_interval(interval);
        attach_suggestions_to_x_axis(&mut x_axis, &buckets, interval);
    }

    let bar_width = calculate_bar_width(&x_axis, interval, num_shape_lists);
    let bar_args = BarArgs {
        bar_width,
        num_shape_lists,
        x_axis: &x_axis,
        y_axis: &y_axis,
    };

    let shape_lists: Vec<_> = input
        .timeseries_data
        .iter()
        .map(|timeseries| ShapeList {
            shapes: if timeseries.visible {
                let bar_index = visible_timeseries_data
                    .iter()
                    .position(|visible_timeseries| visible_timeseries == timeseries)
                    .unwrap_or_default();
                timeseries
                    .metrics
                    .iter()
                    .filter_map(|metric| create_bar_shape(metric, bar_index, &bar_args))
                    .collect()
            } else {
                Vec::new()
            },
            source: *timeseries,
        })
        .collect();

    AbstractChart {
        shape_lists,
        x_axis,
        y_axis,
    }
}

struct BarArgs<'axes> {
    bar_width: f64,
    num_shape_lists: usize,
    x_axis: &'axes Axis,
    y_axis: &'axes Axis,
}

fn create_bar_shape<'source>(
    metric: &'source Metric,
    bar_index: usize,
    args: &BarArgs,
) -> Option<Shape<&'source Metric>> {
    if metric.value.is_nan() {
        return None;
    }

    let group_x = normalize_along_linear_axis(get_time_from_timestamp(metric.time), args.x_axis);
    Some(Shape::Rectangle(Rectangle {
        x: calculate_bar_x(group_x, args.bar_width, bar_index, args.num_shape_lists),
        width: args.bar_width,
        y: 0.,
        height: normalize_along_linear_axis(metric.value, args.y_axis),
        source: metric,
    }))
}
