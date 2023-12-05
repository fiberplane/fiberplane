use crate::chart_to_svg::*;
use crate::fiberplane::{
    generate_stacked_line_chart_from_timeseries, GraphType, Metric, StackingType, TimeRange,
    Timeseries, TimeseriesSourceData, Timestamp,
};
use std::collections::BTreeMap;
use std::str::FromStr;

#[test]
fn test_generate_stacked_line_chart_from_timeseries() {
    let timeseries_a = Timeseries::builder()
        .name("dummy_data")
        .metrics(vec![
            get_metric_at_minute(0, 10.),
            get_metric_at_minute(1, 15.),
            get_metric_at_minute(2, 20.),
            get_metric_at_minute(4, 25.),
            get_metric_at_minute(5, 30.),
            get_metric_at_minute(6, 25.),
            get_metric_at_minute(7, 20.),
            get_metric_at_minute(8, 15.),
            get_metric_at_minute(9, 10.),
        ])
        .labels(BTreeMap::from([("timeseries".to_owned(), "A".to_owned())]))
        .visible(true)
        .build();

    let timeseries_b = Timeseries::builder()
        .name("dummy_data")
        .metrics(vec![
            get_metric_at_minute(0, 40.),
            get_metric_at_minute(1, 30.),
            get_metric_at_minute(2, 20.),
            get_metric_at_minute(3, 10.),
            get_metric_at_minute(4, 20.),
            get_metric_at_minute(5, 30.),
            get_metric_at_minute(6, 40.),
            get_metric_at_minute(7, 50.),
            get_metric_at_minute(8, 60.),
            get_metric_at_minute(9, 70.),
        ])
        .labels(BTreeMap::from([("timeseries".to_owned(), "B".to_owned())]))
        .visible(true)
        .build();

    let chart = generate_stacked_line_chart_from_timeseries(TimeseriesSourceData {
        graph_type: GraphType::Line,
        stacking_type: StackingType::Stacked,
        time_range: TimeRange {
            from: get_date_at_minute(0),
            to: get_date_at_minute(10),
        },
        timeseries_data: &[&timeseries_a, &timeseries_b],
        additional_values: &[],
    });

    insta::assert_yaml_snapshot!(chart);

    let svg = chart_to_svg(
        &chart,
        &ChartOptions {
            width: 640,
            height: 480,
            area_gradient_shown: true,
            axis_lines_shown: false,
            grid_columns_shown: true,
            grid_rows_shown: true,
            grid_stroke_color: "#e7e7e7",
            grid_stroke_dasharray: Default::default(),
            shape_stroke_width: None,
            get_shape_list_color: &|_, index| if index % 2 == 0 { "#c00eae" } else { "#23304a" },
            tick_color: "#a4a4a4",
            x_formatter: Some(FormatterKind::Time),
            y_formatter: Some(FormatterKind::Scientific),
        },
    );

    let svg_lines = svg
        .replace('>', ">\n")
        .split('\n')
        .filter(|line| !line.is_empty())
        .map(str::to_owned)
        .collect::<Vec<_>>();
    insta::assert_debug_snapshot!(svg_lines);
}

fn get_metric_at_minute(minute: u8, value: f64) -> Metric {
    Metric::builder()
        .time(get_date_at_minute(minute))
        .value(value)
        .build()
}

fn get_date_at_minute(minute: u8) -> Timestamp {
    Timestamp::from_str(&format!("2023-07-18T16:{minute:02}:00.000Z")).unwrap()
}
