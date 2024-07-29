use crate::api;
use crate::api::models::SpanKind;
use crate::data::util::{Json, Timestamp};
use serde::Deserialize;
use std::collections::BTreeMap;

#[derive(Debug, Deserialize)]
pub(crate) struct Request {
    pub(crate) id: u32,
    pub(crate) method: String,
    pub(crate) url: String,
    pub(crate) body: String,
    pub(crate) headers: Json<BTreeMap<String, String>>,
}

impl From<Request> for api::models::Request {
    fn from(req: Request) -> Self {
        api::models::Request::new(req.id, req.method, req.url, req.body, req.headers.0)
    }
}

#[derive(Deserialize)]
pub struct Span {
    pub trace_id: String,
    pub span_id: String,
    pub parent_span_id: Option<String>,

    pub name: String,
    pub kind: SpanKind,

    pub start_time: Timestamp,
    pub end_time: Timestamp,

    pub inner: Json<api::models::Span>,
}

impl Span {
    pub fn into_inner(self) -> api::models::Span {
        self.inner.into_inner()
    }
}

impl From<Span> for api::models::Span {
    fn from(value: Span) -> Self {
        value.into_inner()
    }
}

impl From<api::models::Span> for Span {
    fn from(span: api::models::Span) -> Self {
        let trace_id = span.trace_id.clone();
        let span_id = span.span_id.clone();
        let parent_span_id = span.parent_span_id.clone();
        let name = span.name.clone();
        let kind = span.kind.clone();
        let start_time = span.start_time.into();
        let end_time = span.end_time.into();
        let inner = Json(span);

        Self {
            trace_id,
            span_id,
            parent_span_id,
            name,
            kind,
            start_time,
            end_time,
            inner,
        }
    }
}
