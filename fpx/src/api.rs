use crate::data::Store;
use crate::events::ServerEvents;
use crate::inspector::InspectorService;
use crate::service::Service;
use axum::extract::FromRef;
use axum::routing::{any, get, post};
use http::StatusCode;
use url::Url;

pub mod client;
pub mod errors;
pub mod handlers;
pub mod models;
mod studio;
mod ws;

#[derive(Clone)]
pub struct ApiState {
    /// The base url on which this server is running. Override this when you
    /// are running this behind a reverse proxy.
    base_url: Url,

    events: ServerEvents,
    inspector_service: InspectorService,
    service: Service,
    store: Store,
}

impl FromRef<ApiState> for ServerEvents {
    fn from_ref(api_state: &ApiState) -> ServerEvents {
        api_state.events.clone()
    }
}

impl FromRef<ApiState> for InspectorService {
    fn from_ref(api_state: &ApiState) -> InspectorService {
        api_state.inspector_service.clone()
    }
}

impl FromRef<ApiState> for Service {
    fn from_ref(api_state: &ApiState) -> Service {
        api_state.service.clone()
    }
}

impl FromRef<ApiState> for Store {
    fn from_ref(api_state: &ApiState) -> Store {
        api_state.store.clone()
    }
}

/// Create a API and expose it through a axum router.
pub fn create_api(
    base_url: url::Url,
    events: ServerEvents,
    inspector_service: InspectorService,
    service: Service,
    store: Store,
) -> axum::Router {
    let api_state = ApiState {
        base_url,
        events,
        inspector_service,
        service,
        store,
    };
    let api_router = api_router();

    axum::Router::new()
        .route("/v1/traces", post(handlers::otel::trace_collector_handler))
        .nest("/api/", api_router)
        .with_state(api_state)
        .fallback(studio::default_handler)
}

fn api_router() -> axum::Router<ApiState> {
    axum::Router::new()
        .route(
            "/requests/:id",
            get(handlers::request_get_handler).delete(handlers::request_delete_handler),
        )
        .route("/requestor", post(handlers::execute_requestor))
        .route(
            "/inspectors",
            get(handlers::inspector_list_handler).post(handlers::inspector_create_handler),
        )
        .route("/inspect", any(handlers::inspect_request_handler))
        .route("/inspect/:id", any(handlers::inspect_request_handler))
        .route("/ws", get(ws::ws_handler))
        .route(
            "/traces/:trace_id/spans/:span_id",
            get(handlers::spans::span_get_handler),
        )
        .route(
            "/traces/:trace_id/spans",
            get(handlers::spans::span_list_handler),
        )
        .fallback(StatusCode::NOT_FOUND)
}
