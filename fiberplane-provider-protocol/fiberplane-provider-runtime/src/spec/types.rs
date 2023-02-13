#![allow(unused_imports)]
use serde::{Deserialize, Serialize};
use std::{collections::BTreeMap, collections::HashMap};

pub use fiberplane_models::blobs::Blob;
pub use fiberplane_models::blobs::EncodedBlob;
pub use fiberplane_models::formatting::Annotation;
pub use fiberplane_models::formatting::AnnotationWithOffset;
pub use fiberplane_models::formatting::Mention;
pub use fiberplane_models::labels::Label;
pub use fiberplane_models::notebooks::Cell;
pub use fiberplane_models::notebooks::CheckboxCell;
pub use fiberplane_models::notebooks::CodeCell;
pub use fiberplane_models::notebooks::DiscussionCell;
pub use fiberplane_models::notebooks::DividerCell;
pub use fiberplane_models::notebooks::GraphCell;
pub use fiberplane_models::notebooks::GraphType;
pub use fiberplane_models::notebooks::HeadingCell;
pub use fiberplane_models::notebooks::HeadingType;
pub use fiberplane_models::notebooks::ImageCell;
pub use fiberplane_models::notebooks::ListItemCell;
pub use fiberplane_models::notebooks::ListType;
pub use fiberplane_models::notebooks::LogCell;
pub use fiberplane_models::notebooks::LogRecordIndex;
pub use fiberplane_models::notebooks::LogVisibilityFilter;
pub use fiberplane_models::notebooks::ProviderCell;
pub use fiberplane_models::notebooks::StackingType;
pub use fiberplane_models::notebooks::TableCell;
pub use fiberplane_models::notebooks::TableCellValue;
pub use fiberplane_models::notebooks::TableColumnDefinition;
pub use fiberplane_models::notebooks::TextCell;
pub use fiberplane_models::notebooks::TimelineCell;
pub use fiberplane_models::providers::CheckboxField;
pub use fiberplane_models::providers::ConfigField;
pub use fiberplane_models::providers::DateTimeRangeField;
pub use fiberplane_models::providers::Error;
pub use fiberplane_models::providers::FileField;
pub use fiberplane_models::providers::HttpRequest;
pub use fiberplane_models::providers::HttpRequestError;
pub use fiberplane_models::providers::HttpRequestMethod;
pub use fiberplane_models::providers::HttpResponse;
pub use fiberplane_models::providers::IntegerField;
pub use fiberplane_models::providers::LabelField;
pub use fiberplane_models::providers::ProviderRequest;
pub use fiberplane_models::providers::QueryField;
pub use fiberplane_models::providers::SelectField;
pub use fiberplane_models::providers::SupportedQueryType;
pub use fiberplane_models::providers::TextField;
pub use fiberplane_models::providers::ValidationError;
pub use fiberplane_models::timestamps::Timestamp;

pub type ConfigSchema = Vec<ConfigField>;

pub type Formatting = Vec<AnnotationWithOffset>;

/// An individual log record
#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LegacyLogRecord {
    pub timestamp: LegacyTimestamp,
    pub body: String,
    pub attributes: HashMap<String, String>,
    pub resource: HashMap<String, String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub trace_id: Option<bytes::Bytes>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub span_id: Option<bytes::Bytes>,
}

/// Legacy `ProviderRequest` from the Provider 1.0 protocol.
#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum LegacyProviderRequest {
    Proxy(ProxyRequest),
    Logs(QueryLogs),
    /// Check data source status, any issue will be returned as `Error`
    Status,
}

/// Legacy `ProviderResponse` from the 1.0 protocol.
#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum LegacyProviderResponse {
    #[serde(rename_all = "camelCase")]
    Error {
        error: Error,
    },
    #[serde(rename_all = "camelCase")]
    LogRecords {
        log_records: Vec<LegacyLogRecord>,
    },
    StatusOk,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
pub struct LegacyTimeRange {
    pub from: LegacyTimestamp,
    pub to: LegacyTimestamp,
}

pub type LegacyTimestamp = f64;

pub type ProviderConfig = serde_json::Value;

/// Relays requests for a data-source to a proxy server registered with the API.
#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProxyRequest {
    /// ID of the proxy as known by the API.
    pub proxy_id: String,

    /// Name of the data source exposed by the proxy.
    pub data_source_name: String,

    /// Request data to send to the proxy
    pub request: bytes::Bytes,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QueryLogs {
    pub query: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub limit: Option<u32>,
    pub time_range: LegacyTimeRange,
}

pub type QuerySchema = Vec<QueryField>;

pub type TableRowData = BTreeMap<String, TableCellValue>;
