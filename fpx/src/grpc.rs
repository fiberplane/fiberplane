use fpx_lib::service::Service;
use opentelemetry_proto::tonic::collector::trace::v1::trace_service_server::TraceService;
use opentelemetry_proto::tonic::collector::trace::v1::{
    ExportTraceServiceRequest, ExportTraceServiceResponse,
};
use tracing::error;

#[derive(Clone)]
pub struct GrpcService {
    service: Service,
}

impl GrpcService {
    pub fn new(service: Service) -> Self {
        Self { service }
    }
}

#[tonic::async_trait]
impl TraceService for GrpcService {
    #[allow(clippy::blocks_in_conditions)] // The generated code contains a clippy issue, so just ignore that
    #[tracing::instrument(skip_all, err)]
    async fn export(
        &self,
        request: tonic::Request<ExportTraceServiceRequest>,
    ) -> Result<tonic::Response<ExportTraceServiceResponse>, tonic::Status> {
        let request = request.into_inner();

        let response = self.service.ingest_export(request).await.map_err(|err| {
            error!(?err, "Failed to ingest export data");
            tonic::Status::internal("Failed to ingest export data")
        })?;

        Ok(tonic::Response::new(response))
    }
}
