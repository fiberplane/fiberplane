mod constants;
mod generate_bar_chart_from_timeseries;
mod generate_line_chart_from_timeseries;
mod generate_shape_list_from_events;
mod generate_shape_list_from_target_latency;
mod generate_stacked_bar_chart_from_timeseries;
mod generate_stacked_line_chart_from_timeseries;
mod types;
mod utils;

#[cfg(test)]
mod tests;

use generate_bar_chart_from_timeseries::generate_bar_chart_from_timeseries;
use generate_line_chart_from_timeseries::generate_line_chart_from_timeseries;
use generate_shape_list_from_events::generate_shape_list_from_events;
use generate_stacked_bar_chart_from_timeseries::generate_stacked_bar_chart_from_timeseries;
use generate_stacked_line_chart_from_timeseries::generate_stacked_line_chart_from_timeseries;
pub use types::*;

use crate::MondrianChart;

use self::generate_shape_list_from_target_latency::generate_shape_list_from_target_latency;

/// Generates an abstract chart from a combination of timeseries data, events
/// and an optional target latency.
///
/// May return `None` if the graph type is unrecognized.
pub fn generate<'source>(
    input: CombinedSourceData<'source, '_>,
) -> Option<MondrianChart<SeriesSource<'source>, PointSource<'source>>> {
    let CombinedSourceData {
        graph_type,
        stacking_type,
        timeseries_data,
        events,
        target_latency,
        time_range,
    } = input;

    let chart = generate_from_timeseries(TimeseriesSourceData {
        graph_type,
        stacking_type,
        timeseries_data,
        time_range,
        additional_values: &target_latency.iter().cloned().collect::<Vec<_>>(),
    })?;

    let mut chart: MondrianChart<SeriesSource, PointSource> = chart.into();

    if graph_type == GraphType::Line && !events.is_empty() {
        chart
            .shape_lists
            .push(generate_shape_list_from_events(&chart.x_axis, events));
    }

    if let Some(latency) = target_latency {
        chart
            .shape_lists
            .push(generate_shape_list_from_target_latency(
                &chart.y_axis,
                latency,
            ));
    }

    Some(chart)
}

/// Generates an abstract chart from the given timeseries data.
///
/// May return `None` if the graph type is unrecognized.
pub fn generate_from_timeseries<'source>(
    input: TimeseriesSourceData<'source, '_, '_>,
) -> Option<MondrianChart<&'source Timeseries, &'source Metric>> {
    let abstract_chart = match (input.graph_type, input.stacking_type) {
        (GraphType::Line, StackingType::None) => generate_line_chart_from_timeseries(input),
        (GraphType::Line, _) => generate_stacked_line_chart_from_timeseries(input),
        (GraphType::Bar, StackingType::None) => generate_bar_chart_from_timeseries(input),
        (GraphType::Bar, _) => generate_stacked_bar_chart_from_timeseries(input),
        (_, _) => return None,
    };

    Some(abstract_chart)
}
