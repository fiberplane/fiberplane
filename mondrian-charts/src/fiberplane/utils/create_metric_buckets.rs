use crate::fiberplane::{Buckets, Metric, Timeseries};
use std::collections::BTreeMap;

/// Creates buckets from timeseries, and reduces the metrics to calculated
/// values per bucket.
///
/// For each unique timestamp encountered among the metrics, we create a new
/// bucket, while the value inside each bucket represents the reduced value for
/// all metrics matching that timestamp.
pub(crate) fn create_metric_buckets<T: Clone>(
    timeseries_data: &[&Timeseries],
    reducer: impl Fn(Option<T>, f64) -> T,
) -> Buckets<T> {
    let mut buckets = BTreeMap::new();

    for timeseries in timeseries_data {
        if !timeseries.visible {
            continue;
        }

        for Metric { time, value, .. } in &timeseries.metrics {
            if !value.is_nan() {
                buckets.insert(*time, reducer(buckets.get(time).cloned(), *value));
            }
        }
    }

    buckets
}
