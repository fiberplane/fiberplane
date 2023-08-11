use crate::chart_to_svg::*;
use crate::fiberplane::{
    generate, CombinedSourceData, GraphType, Metric, ProviderEvent, SeriesSource, StackingType,
    TimeRange, Timeseries, Timestamp,
};
use std::str::FromStr;

#[test]
fn test_generate_line_chart_from_timeseries() {
    let events = vec![
        get_event_at_minute(2, "deploy 1"),
        get_event_at_minute(7, "deploy 2"),
    ];

    let timeseries = Timeseries::builder()
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
        .visible(true)
        .build();

    let target_latency = 40.;

    let chart = generate(CombinedSourceData {
        graph_type: GraphType::Line,
        stacking_type: StackingType::None,
        time_range: TimeRange {
            from: get_date_at_minute(0),
            to: get_date_at_minute(10),
        },
        timeseries_data: &[&timeseries],
        events: &events.iter().collect::<Vec<_>>(),
        target_latency: Some(target_latency),
    })
    .unwrap();

    insta::assert_yaml_snapshot!(chart);

    let svg = chart_to_svg(
        &chart,
        &ChartOptions {
            width: 640,
            height: 480,
            area_gradient_shown: true,
            grid_borders_shown: true,
            grid_shown: false,
            grid_stroke_color: "#e7e7e7".to_owned(),
            grid_stroke_dasharray: Default::default(),
            get_shape_list_color: &|source, _| match source {
                SeriesSource::Timeseries(_) => "#c00eae",
                SeriesSource::Events => "#4c7aff",
                SeriesSource::TargetLatency => "#63eaad",
            },
            tick_color: "#a4a4a4".to_owned(),
            x_formatter: FormatterKind::Time,
            y_formatter: FormatterKind::Duration,
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

fn get_event_at_minute(minute: u8, title: &str) -> ProviderEvent {
    ProviderEvent::builder()
        .time(get_date_at_minute(minute))
        .title(title)
        .build()
}
