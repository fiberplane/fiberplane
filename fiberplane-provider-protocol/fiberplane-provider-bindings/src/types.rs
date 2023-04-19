#![allow(unused_imports)]
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

pub use fiberplane_models::formatting::Annotation;
pub use fiberplane_models::formatting::AnnotationWithOffset;
pub use fiberplane_models::providers::ArrayField;
pub use fiberplane_models::providers::AutoSuggestRequest;
pub use fiberplane_models::blobs::Blob;
pub use fiberplane_models::notebooks::Cell;
pub use fiberplane_models::notebooks::CheckboxCell;
pub use fiberplane_models::providers::CheckboxField;
pub use fiberplane_models::notebooks::CodeCell;
pub use fiberplane_models::providers::ConfigField;
pub use fiberplane_models::providers::DateTimeRangeField;
pub use fiberplane_models::notebooks::DiscussionCell;
pub use fiberplane_models::notebooks::DividerCell;
pub use fiberplane_models::blobs::EncodedBlob;
pub use fiberplane_models::providers::Error;
pub use fiberplane_models::providers::FileField;
pub use fiberplane_models::notebooks::GraphCell;
pub use fiberplane_models::notebooks::GraphType;
pub use fiberplane_models::notebooks::HeadingCell;
pub use fiberplane_models::notebooks::HeadingType;
pub use fiberplane_models::providers::HttpRequest;
pub use fiberplane_models::providers::HttpRequestError;
pub use fiberplane_models::providers::HttpRequestMethod;
pub use fiberplane_models::providers::HttpResponse;
pub use fiberplane_models::notebooks::ImageCell;
pub use fiberplane_models::providers::IntegerField;
pub use fiberplane_models::labels::Label;
pub use fiberplane_models::providers::LabelField;
pub use fiberplane_models::notebooks::ListItemCell;
pub use fiberplane_models::notebooks::ListType;
pub use fiberplane_models::notebooks::LogCell;
pub use fiberplane_models::notebooks::LogRecordIndex;
pub use fiberplane_models::notebooks::LogVisibilityFilter;
pub use fiberplane_models::formatting::Mention;
pub use fiberplane_models::providers::Metric;
pub use fiberplane_models::providers::OtelMetadata;
pub use fiberplane_models::providers::OtelSeverityNumber;
pub use fiberplane_models::providers::OtelSpanId;
pub use fiberplane_models::providers::OtelTraceId;
pub use fiberplane_models::notebooks::ProviderCell;
pub use fiberplane_models::providers::ProviderEvent;
pub use fiberplane_models::providers::ProviderRequest;
pub use fiberplane_models::providers::ProviderStatus;
pub use fiberplane_models::providers::QueryField;
pub use fiberplane_models::providers::SelectField;
pub use fiberplane_models::notebooks::StackingType;
pub use fiberplane_models::providers::Suggestion;
pub use fiberplane_models::providers::SupportedQueryType;
pub use fiberplane_models::notebooks::TableCell;
pub use fiberplane_models::notebooks::TableCellValue;
pub use fiberplane_models::notebooks::TableColumnDefinition;
pub use fiberplane_models::notebooks::TextCell;
pub use fiberplane_models::providers::TextField;
pub use fiberplane_models::notebooks::TimelineCell;
pub use fiberplane_models::providers::Timeseries;
pub use fiberplane_models::timestamps::Timestamp;
pub use fiberplane_models::providers::ValidationError;

pub type ConfigSchema = Vec<ConfigField>;

pub type Formatting = Vec<AnnotationWithOffset>;

pub type ProviderConfig = serde_json::Value;

pub type QuerySchema = Vec<QueryField>;

pub type TableRowData = BTreeMap<String, TableCellValue>;
