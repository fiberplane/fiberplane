use crate::generate_shape_list_from_events;
use crate::types::{Axis, ProviderEvent, Timestamp};
use crate::utils::get_time_from_timestamp;
use std::str::FromStr;

#[test]
fn test_generate_shape_list_from_events() {
    let events = vec![
        get_event_at_minute(2, "deploy 1"),
        get_event_at_minute(7, "deploy 2"),
    ];

    let shape_list = generate_shape_list_from_events(
        &Axis {
            min_value: get_time_from_timestamp(get_date_at_minute(0)),
            max_value: get_time_from_timestamp(get_date_at_minute(10)),
            tick_suggestions: None,
        },
        &events.iter().collect::<Vec<_>>(),
    );

    insta::assert_yaml_snapshot!(shape_list);
}

fn get_event_at_minute(minute: u8, title: &str) -> ProviderEvent {
    ProviderEvent::builder()
        .time(get_date_at_minute(minute))
        .title(title)
        .build()
}

fn get_date_at_minute(minute: u8) -> Timestamp {
    Timestamp::from_str(&format!("2023-07-18T16:{minute:02}:00.000Z")).unwrap()
}
