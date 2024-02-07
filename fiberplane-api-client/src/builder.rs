use crate::api_client::ApiClient;
use anyhow::Result;
use reqwest::{header, Url};
use std::time::Duration;

#[derive(Debug)]
pub struct ApiClientBuilder {
    // Some client specific values
    base_url: Url,
    timeout: Option<Duration>,

    // These values will be mapped to header values
    user_agent: Option<String>,
    bearer_token: Option<String>,
}

impl ApiClientBuilder {
    pub fn new(base_url: Url) -> Self {
        Self {
            base_url,
            timeout: None,
            user_agent: None,
            bearer_token: None,
        }
    }

    /// Override the base_url for the ApiClient.
    pub fn base_url(mut self, base_url: Url) -> Self {
        self.base_url = base_url;
        self
    }

    /// Change the timeout for the ApiClient.
    pub fn timeout(mut self, timeout: Option<Duration>) -> Self {
        self.timeout = timeout;
        self
    }

    /// Override the user agent for the ApiClient.
    pub fn user_agent(mut self, user_agent: Option<impl Into<String>>) -> Self {
        self.user_agent = user_agent.map(|agent| agent.into());
        self
    }

    /// Set an authentication token for the ApiClient.
    pub fn bearer_token(mut self, bearer_token: Option<impl Into<String>>) -> Self {
        self.bearer_token = bearer_token.map(|token| token.into());
        self
    }

    pub fn build_client(&self) -> Result<reqwest::Client> {
        let mut headers = header::HeaderMap::new();

        headers.insert(
            header::USER_AGENT,
            header::HeaderValue::from_str(
                self.user_agent
                    .as_deref()
                    .unwrap_or("Fiberplane Rust API client"),
            )?,
        );

        if let Some(bearer) = &self.bearer_token {
            headers.insert(
                header::AUTHORIZATION,
                header::HeaderValue::from_str(&format!("Bearer {}", bearer))?,
            );
        }

        let client = reqwest::Client::builder()
            .connect_timeout(self.timeout.unwrap_or_else(|| Duration::from_secs(5)))
            .default_headers(headers)
            .build()?;

        Ok(client)
    }

    /// Build the ApiClient.
    pub fn build(self) -> Result<ApiClient> {
        let client = self.build_client()?;
        let server = self.base_url;
        Ok(ApiClient { client, server })
    }
}
