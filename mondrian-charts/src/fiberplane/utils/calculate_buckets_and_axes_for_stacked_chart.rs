use super::{calculate_stacked_y_axis_range, create_metric_buckets, get_x_axis_from_time_range};
use crate::fiberplane::{Buckets, StackedChartBucketValue, StackingType, TimeseriesSourceData};
use crate::types::Axis;

pub(crate) struct BucketsAndAxes {
    pub buckets: Buckets<StackedChartBucketValue>,
    pub is_percentage: bool,
    pub x_axis: Axis,
    pub y_axis: Axis,
}

/// Wrapper around [`create_metric_buckets()`] and axes creation specialized for
/// usage with stacked charts.
pub(crate) fn calculate_buckets_and_axes_for_stacked_chart(
    input: &TimeseriesSourceData,
) -> BucketsAndAxes {
    let buckets = create_metric_buckets(input.timeseries_data, |acc, value| {
        acc.map(|acc: StackedChartBucketValue| StackedChartBucketValue {
            current_y: acc.current_y,
            total: acc.total + value,
        })
        .unwrap_or(StackedChartBucketValue {
            current_y: 0.,
            total: value,
        })
    });

    let is_percentage = input.stacking_type == StackingType::Percentage;

    let x_axis = get_x_axis_from_time_range(&input.time_range);
    let y_axis = if is_percentage {
        Axis {
            min_value: 0.,
            max_value: 1.,
            ..Default::default()
        }
    } else {
        calculate_stacked_y_axis_range(&buckets, |value| value.total)
    };

    BucketsAndAxes {
        buckets,
        is_percentage,
        x_axis,
        y_axis,
    }
}
