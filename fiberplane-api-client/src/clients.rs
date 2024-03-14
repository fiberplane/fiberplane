use crate::builder::ApiClientBuilder;
use anyhow::{Context as _, Result};
use reqwest::{header, Client, Method, RequestBuilder, Url};
use std::time::Duration;

pub fn default_config(
    timeout: Option<Duration>,
    user_agent: Option<&str>,
    default_headers: Option<header::HeaderMap>,
) -> Result<Client> {
    let mut headers = default_headers.unwrap_or_default();
    headers.insert(
        header::USER_AGENT,
        header::HeaderValue::from_str(user_agent.unwrap_or("Fiberplane Rust API client"))?,
    );

    Ok(Client::builder()
        .connect_timeout(timeout.unwrap_or_else(|| Duration::from_secs(10)))
        .default_headers(headers)
        .build()?)
}

pub fn production_client() -> Result<crate::api_client::ApiClient> {
    let url = "https://studio.fiberplane.com/";

    let config = default_config(Some(Duration::from_secs(30)), None, None)?;

    Ok(crate::api_client::ApiClient {
        client: config,
        server: Url::parse(url).context("Failed to parse base url from Open API document")?,
    })
}

pub fn non_production_client(env: Option<&str>) -> Result<crate::api_client::ApiClient> {
    let env = env.unwrap_or("dev");
    let url = &format!("https://{env}.fiberplane.io/", env = env);

    let config = default_config(Some(Duration::from_secs(30)), None, None)?;

    Ok(crate::api_client::ApiClient {
        client: config,
        server: Url::parse(url).context("Failed to parse base url from Open API document")?,
    })
}

#[deprecated(
    note = "Use `fiberplane_api_client::ApiClient` or `fiberplane::fiberplane_api_client::ApiClient` instead"
)]
pub type ApiClient = crate::ApiClient;
