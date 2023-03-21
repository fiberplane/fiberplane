use crate::{events::Event, timestamps::Timestamp};
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::BTreeMap;
use typed_builder::TypedBuilder;

/// A single event that is used within providers.
///
/// Events occur at a given time and optionally last until a given end time.
/// They may contain both event-specific metadata as well as OpenTelemetry
/// metadata.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct ProviderEvent {
    #[builder(setter(into))]
    pub time: Timestamp,

    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub end_time: Option<Timestamp>,

    #[builder(default)]
    #[serde(flatten)]
    pub otel: OtelMetadata,

    #[builder(setter(into))]
    pub title: String,

    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,

    #[builder(default, setter(strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub severity: Option<OtelSeverityNumber>,

    #[builder(default)]
    pub labels: BTreeMap<String, String>,
}

/// A single metric value.
///
/// Metric values are taken at a specific timestamp and contain a floating-point
/// value as well as OpenTelemetry metadata.
#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct Metric {
    pub time: Timestamp,

    #[serde(flatten)]
    pub otel: OtelMetadata,

    pub value: f64,
}

/// Metadata following the OpenTelemetry metadata spec.
#[derive(Clone, Debug, Default, Deserialize, Eq, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct OtelMetadata {
    pub attributes: BTreeMap<String, Value>,

    pub resource: BTreeMap<String, Value>,

    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub trace_id: Option<OtelTraceId>,

    #[builder(default, setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub span_id: Option<OtelSpanId>,
}

/// SeverityNumber, as specified by OpenTelemetry:
///  https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/logs/data-model.md#field-severitynumber
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct OtelSeverityNumber(pub u8);

/// Span ID, as specified by OpenTelemetry:
///  https://opentelemetry.io/docs/reference/specification/overview/#spancontext
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct OtelSpanId([u8; 8]);

impl OtelSpanId {
    /// Creates a new span ID from the raw data.
    pub fn new(data: [u8; 8]) -> Self {
        Self(data)
    }

    /// Returns the raw bytes of the span ID.
    pub fn raw(&self) -> &[u8; 8] {
        &self.0
    }
}

impl From<[u8; 8]> for OtelSpanId {
    fn from(value: [u8; 8]) -> Self {
        Self::new(value)
    }
}

/// Trace ID, as specified by OpenTelemetry:
///  https://opentelemetry.io/docs/reference/specification/overview/#spancontext
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct OtelTraceId([u8; 16]);

impl OtelTraceId {
    /// Creates a new trace ID from the raw data.
    pub fn new(data: [u8; 16]) -> Self {
        Self(data)
    }

    /// Returns the raw bytes of the trace ID.
    pub fn raw(&self) -> &[u8; 16] {
        &self.0
    }
}

impl From<[u8; 16]> for OtelTraceId {
    fn from(value: [u8; 16]) -> Self {
        Self::new(value)
    }
}

/// A timeline of events. It is shown split by days, so we store
/// events days as an array of day strings in the format "YYYY-MM-DD"
/// and a map of day strings to  all events that happen that day.
#[derive(Clone, Debug, Default, Deserialize, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct Timeline {
    pub days: Vec<String>,
    pub events_by_day: BTreeMap<String, Vec<Event>>,
    #[serde(flatten)]
    pub otel: OtelMetadata,
}

/// A series of metrics over time, with metadata.
#[derive(Clone, Debug, Default, Deserialize, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::providers")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct Timeseries {
    #[builder(setter(into))]
    pub name: String,

    #[builder(default, setter(into))]
    pub labels: BTreeMap<String, String>,

    #[builder(default)]
    pub metrics: Vec<Metric>,

    #[serde(flatten)]
    pub otel: OtelMetadata,

    /// Whether the series should be rendered. Can be toggled by the user.
    #[serde(default)]
    pub visible: bool,
}
