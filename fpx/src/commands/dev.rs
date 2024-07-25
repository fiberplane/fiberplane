use crate::api;
use crate::data::migrations::migrate;
use crate::data::{DataPath, Store};
use crate::events::Events;
use crate::grpc::GrpcService;
use crate::{initialize_fpx_dir, service};
use anyhow::{Context, Result};
use opentelemetry_proto::tonic::collector::trace::v1::trace_service_server::TraceServiceServer;
use std::future::IntoFuture;
use std::{path::PathBuf, process::exit};
use tokio::select;
use tracing::info;
use tracing::{error, warn};

#[derive(clap::Args, Debug)]
pub struct Args {
    /// The address to listen on.
    #[arg(short, long, env, default_value = "127.0.0.1:6767")]
    pub listen_address: String,

    /// The address for the OTEL ingestion gRPC service to listen on.
    #[arg(long, env, default_value = "127.0.0.1:4567")]
    pub grpc_listen_address: String,

    /// The base URL of the server.
    #[arg(short, long, env, default_value = "http://localhost:6767")]
    pub base_url: url::Url,

    /// Enable in-memory database. Useful when debugging.
    #[clap(long, env, hide = true)]
    pub in_memory_database: bool,

    /// fpx directory
    #[arg(from_global)]
    pub fpx_directory: PathBuf,
}

pub async fn handle_command(args: Args) -> Result<()> {
    initialize_fpx_dir(args.fpx_directory.as_path()).await?;

    let store = open_store(&args).await?;

    migrate(&store).await?;

    // Create a shared events struct, which allows events to be send to
    // WebSocket connections.
    let events = Events::new();

    let inspector_service = crate::inspector::InspectorService::start(
        args.fpx_directory.join("inspectors"),
        store.clone(),
        events.clone(),
    )
    .await?;

    let service = service::Service::new(store.clone(), events.clone());

    let app = api::create_api(
        args.base_url.clone(),
        events.clone(),
        inspector_service,
        service.clone(),
        store.clone(),
    );
    let grpc_service = GrpcService::new(service);

    let listener = tokio::net::TcpListener::bind(&args.listen_address)
        .await
        .with_context(|| format!("Failed to bind to address: {}", args.listen_address))?;

    // This future will resolve once `ctrl-c` is pressed.
    let api_shutdown = async {
        tokio::signal::ctrl_c()
            .await
            .expect("Failed to listen for ctrl-c");

        info!("Received SIGINT, shutting down api server");

        // Monitor for another SIGINT, and force shutdown if received.
        tokio::spawn(async {
            tokio::signal::ctrl_c()
                .await
                .expect("Failed to listen for ctrl-c");

            warn!("Received another SIGINT, forcing shutdown");
            exit(1);
        });
    };
    let grpc_shutdown = async {
        tokio::signal::ctrl_c()
            .await
            .expect("Failed to listen for ctrl-c");
    };

    info!(
        api_listen_address = ?listener.local_addr().context("Failed to get local address")?,
        grpc_listen_address = ?args.grpc_listen_address,
        "Starting server",
    );

    let task1 = axum::serve(listener, app)
        .with_graceful_shutdown(api_shutdown)
        .into_future();
    let task2 = tonic::transport::Server::builder()
        .add_service(TraceServiceServer::new(grpc_service))
        .serve_with_shutdown(args.grpc_listen_address.parse()?, grpc_shutdown);

    select!(
        result = task1 => {
            match result {
                Ok(_) => info!("API server shutdown gracefully"),
                Err(err) => error!(?err, "API server failed"),
            };
        },
        result = task2 => {
            match result {
                Ok(_) => info!("gRPC server shutdown gracefully"),
                Err(err) => error!(?err, "gRPC server failed"),
            };
        }
    );

    Ok(())
}

async fn open_store(args: &Args) -> Result<Store> {
    let db_path = if args.in_memory_database {
        DataPath::InMemory
    } else {
        DataPath::File(args.fpx_directory.join("fpx.db"))
    };

    let store = Store::open(db_path).await?;

    Ok(store)
}
