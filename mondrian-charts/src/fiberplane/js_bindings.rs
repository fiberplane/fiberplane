use super::generate;
use super::types::*;
use crate::MondrianChart;
use fiberplane_models::providers::OtelMetadata;
use serde::Serialize;
use std::collections::BTreeMap;
use wasm_bindgen::convert::FromWasmAbi;
use wasm_bindgen::convert::IntoWasmAbi;
use wasm_bindgen::prelude::*;

/// Owned version of [`TimeseriesSourceData`].
///
/// See [`TimeseriesSourceData`] for more information.
pub(crate) struct OwnedTimeseriesSourceData {
    pub graph_type: GraphType,
    pub stacking_type: StackingType,
    pub timeseries_data: Vec<Timeseries>,
    pub time_range: TimeRange,
    pub additional_values: Vec<f64>,
}

/// Owned version of [`CombinedSourceData`].
///
/// See [`CombinedSourceData`] for more information.
pub struct OwnedCombinedSourceData {
    pub graph_type: GraphType,
    pub stacking_type: StackingType,
    pub timeseries_data: Vec<Timeseries>,
    pub events: Vec<ProviderEvent>,
    pub target_latency: Option<f64>,
    pub time_range: TimeRange,
}

/// Owned version of [`SeriesSource`].
///
/// See [`SeriesSource`] for more information.
#[derive(Serialize)]
#[non_exhaustive]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum OwnedSeriesSource {
    Timeseries(TimeseriesWithoutMetrics),
    Events,
    TargetLatency,
}

/// Owned version of [`PointSource`].
///
/// See [`PointSource`] for more information.
#[derive(Serialize)]
#[non_exhaustive]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum OwnedPointSource {
    Metric(Metric),
    Event(ProviderEvent),
    None,
}

/// Timeseries without points to avoid double serialization overhead for the
/// metrics.
#[derive(Serialize)]
pub struct TimeseriesWithoutMetrics {
    pub name: String,
    pub labels: BTreeMap<String, String>,
    #[serde(flatten)]
    pub otel: OtelMetadata,
    pub visible: bool,
}

impl IntoWasmAbi for TimeseriesWithoutMetrics {
    type Abi = JsValue;

    fn into_abi(self) -> Self::Abi {
        JsValue::
    }
}

#[wasm_bindgen(js_name = generate)]
pub fn generate_js(
    input: OwnedCombinedSourceData,
) -> Option<MondrianChart<OwnedSeriesSource, OwnedPointSource>> {
    let source_data = CombinedSourceData {
        graph_type: input.graph_type,
        stacking_type: input.stacking_type,
        timeseries_data: &input
            .timeseries_data
            .iter()
            .map(|timeseries| &timeseries)
            .collect(),
        events: &input.events.iter().map(|event| &event).collect(),
        target_latency: input.target_latency,
        time_range: input.time_range,
    };

    let chart = generate(input)?;

    Some(chart)
}
