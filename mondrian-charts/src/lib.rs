mod constants;
mod generate_bar_chart_from_timeseries;
mod generate_line_chart_from_timeseries;
mod generate_shape_list_from_events;
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
pub use types::{
    AbstractChart, Axis, GraphType, Metric, PointSource, SeriesSource, StackingType, Timeseries,
    TimeseriesAndEventsSourceData, TimeseriesSourceData,
};

/// Generates an abstract chart from the given timeseries data.
///
/// May return `None` if the graph type is unrecognized.
pub fn generate_from_timeseries<'source>(
    input: TimeseriesSourceData<'source, '_>,
) -> Option<AbstractChart<&'source Timeseries, &'source Metric>> {
    let abstract_chart = match (input.graph_type, input.stacking_type) {
        (GraphType::Line, StackingType::None) => generate_line_chart_from_timeseries(input),
        (GraphType::Line, _) => generate_stacked_line_chart_from_timeseries(input),
        (GraphType::Bar, StackingType::None) => generate_bar_chart_from_timeseries(input),
        (GraphType::Bar, _) => generate_stacked_bar_chart_from_timeseries(input),
        (_, _) => return None,
    };

    Some(abstract_chart)
}

/// Generates an abstract chart from the given timeseries data and events.
///
/// Note we only support generating line charts from combined timeseries and
/// events data. If `graph_type` is anything other than [`GraphType::Line`],
/// the events will be ignored.
///
/// May return `None` if the graph type is unrecognized altogether.
pub fn generate_from_timeseries_and_events<'source>(
    input: TimeseriesAndEventsSourceData<'source, '_>,
) -> Option<AbstractChart<SeriesSource<'source>, PointSource<'source>>> {
    let TimeseriesAndEventsSourceData {
        graph_type,
        stacking_type,
        timeseries_data,
        events,
        time_range,
    } = input;

    let Some(chart) = generate_from_timeseries(TimeseriesSourceData {
        graph_type,
        stacking_type,
        timeseries_data,
        time_range,
    }) else {
        return None;
    };

    let mut chart: AbstractChart<SeriesSource, PointSource> = chart.into();

    if !events.is_empty() {
        chart
            .shape_lists
            .push(generate_shape_list_from_events(&chart.x_axis, events));
    }

    Some(chart)
}
