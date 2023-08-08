use super::get_time_from_timestamp;
use crate::fiberplane::Buckets;
use crate::types::Axis;

/// Adds suggestions to the axis based on the position of the first bucket and
/// the interval between buckets.
pub(crate) fn attach_suggestions_to_x_axis<T>(
    x_axis: &mut Axis,
    buckets: &Buckets<T>,
    interval: f64,
) {
    if interval <= 0. {
        return;
    }

    let Some(mut suggestion) = get_first_bucket_time(buckets) else {
        return;
    };

    let mut suggestions = Vec::new();

    while suggestion < x_axis.max_value {
        if suggestion >= x_axis.min_value {
            suggestions.push(suggestion);
        }

        suggestion += interval;
    }

    x_axis.tick_suggestions = Some(suggestions);
}

fn get_first_bucket_time<T>(buckets: &Buckets<T>) -> Option<f64> {
    let mut first_bucket_timestamp = None;
    for timestamp in buckets.keys() {
        if first_bucket_timestamp
            .map(|first_bucket_timestamp| timestamp < first_bucket_timestamp)
            .unwrap_or(true)
        {
            first_bucket_timestamp = Some(timestamp);
        }
    }

    first_bucket_timestamp.cloned().map(get_time_from_timestamp)
}

#[cfg(test)]
mod tests {
    use super::super::get_time_from_timestamp;
    use super::attach_suggestions_to_x_axis;
    use crate::fiberplane::types::{Buckets, Timestamp};
    use crate::types::Axis;
    use std::str::FromStr;

    #[test]
    fn test_it_attaches_the_right_suggestions() {
        let buckets = Buckets::from([
            (get_date_at_minute_and_second(1, 0), 10),
            (get_date_at_minute_and_second(2, 0), 15),
            (get_date_at_minute_and_second(3, 0), 20),
        ]);

        let mut axis = Axis {
            min_value: get_time_from_timestamp(get_date_at_minute_and_second(0, 23)),
            max_value: get_time_from_timestamp(get_date_at_minute_and_second(4, 23)),
            tick_suggestions: None,
        };
        attach_suggestions_to_x_axis(&mut axis, &buckets, 60.);

        assert_eq!(
            axis.tick_suggestions,
            Some(vec![
                get_time_from_timestamp(get_date_at_minute_and_second(1, 0)),
                get_time_from_timestamp(get_date_at_minute_and_second(2, 0)),
                get_time_from_timestamp(get_date_at_minute_and_second(3, 0)),
                get_time_from_timestamp(get_date_at_minute_and_second(4, 0)),
            ])
        );
    }

    #[test]
    fn test_it_doesnt_attach_suggestions_outside_min_max() {
        let buckets = Buckets::from([
            (get_date_at_minute_and_second(0, 0), 5),
            (get_date_at_minute_and_second(1, 0), 10),
            (get_date_at_minute_and_second(2, 0), 15),
            (get_date_at_minute_and_second(3, 0), 20),
            (get_date_at_minute_and_second(4, 0), 25),
            (get_date_at_minute_and_second(5, 0), 30),
        ]);

        let mut axis = Axis {
            min_value: get_time_from_timestamp(get_date_at_minute_and_second(0, 23)),
            max_value: get_time_from_timestamp(get_date_at_minute_and_second(4, 23)),
            tick_suggestions: None,
        };
        attach_suggestions_to_x_axis(&mut axis, &buckets, 60.);

        assert_eq!(
            axis.tick_suggestions,
            Some(vec![
                get_time_from_timestamp(get_date_at_minute_and_second(1, 0)),
                get_time_from_timestamp(get_date_at_minute_and_second(2, 0)),
                get_time_from_timestamp(get_date_at_minute_and_second(3, 0)),
                get_time_from_timestamp(get_date_at_minute_and_second(4, 0)),
            ])
        );
    }

    fn get_date_at_minute_and_second(minute: u8, second: u8) -> Timestamp {
        Timestamp::from_str(&format!("2023-07-18T16:{minute:02}:{second:02}.000Z")).unwrap()
    }
}
