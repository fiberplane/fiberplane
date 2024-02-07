use crate::builder::ApiClientBuilder;
use anyhow::Result;
use bytes::Bytes;
use fiberplane_models::paging::{PagedVec, HAS_MORE_RESULTS_KEY, TOTAL_RESULTS_KEY};
use reqwest::{Client, Method, RequestBuilder, Response, StatusCode};
use thiserror::Error;
use url::Url;

#[derive(Debug, Error)]
pub enum ApiClientError<T> {
    /// This can only occur when a invalid base URL was provided.
    #[error("An invalid URL was provided: {0}")]
    ParseError(#[from] url::ParseError),

    /// An error occurred in reqwest.
    #[error("An error occurred while making the request: {0}")]
    ClientError(#[from] reqwest::Error),

    /// An error returned from the service. These errors are specific to the
    /// endpoint that was called.
    #[error(transparent)]
    ServiceError(T),

    /// A response was received, but we were unable to deserialize it. The
    /// status code and the receive body are returned.
    #[error("API returned an unknown response: Status: {0}, Body: {1:?}")]
    InvalidResponse(StatusCode, Bytes),
}

#[derive(Debug)]
pub struct ApiClient {
    pub client: Client,
    pub server: Url,
}

impl ApiClient {
    pub fn request(
        &self,
        method: Method,
        endpoint: &str,
    ) -> Result<RequestBuilder, url::ParseError> {
        let url = self.server.join(endpoint)?;

        Ok(self.client.request(method, url))
    }

    pub fn builder(base_url: Url) -> ApiClientBuilder {
        ApiClientBuilder::new(base_url)
    }

    pub async fn do_req_paged<T, E>(
        &self,
        req: RequestBuilder,
    ) -> Result<PagedVec<T>, ApiClientError<E>>
    where
        T: serde::de::DeserializeOwned,
        E: serde::de::DeserializeOwned,
    {
        // Send the request
        let response = req.send().await?;

        // Copy the status code here in case we are unable to parse the response as
        // the Ok or Err variant. Same applies to the headers.
        let status_code = response.status();
        let has_more_results = Self::parse_has_more_results_header(&response);
        let total_results = Self::parse_total_results_header(&response);

        // Read the entire response into a buffer.
        let body = response.bytes().await?;

        // Try to parse the result as R. If it succeeds, return the result.
        if let Ok(result) = serde_json::from_slice::<Vec<T>>(&body) {
            //get header values
            let result = PagedVec {
                inner: result,
                has_more_results,
                total_results,
            };
            return Ok(result);
        }

        // Try to parse the result as E.
        if let Ok(result) = serde_json::from_slice::<E>(&body) {
            return Err(ApiClientError::ServiceError(result));
        }

        // If both failed, return the status_code and the body for the user to
        // debug.
        Err(ApiClientError::InvalidResponse(status_code, body))
    }

    pub async fn do_req<T, E>(&self, req: RequestBuilder) -> Result<T, ApiClientError<E>>
    where
        T: serde::de::DeserializeOwned,
        E: serde::de::DeserializeOwned,
    {
        // Make request
        let response = req.send().await?;

        // Copy the status code here in case we are unable to parse the response as
        // the Ok or Err variant.
        let status_code = response.status();

        // Read the entire response into a local buffer.
        let body = response.bytes().await?;

        // Try to parse the result as R.
        if let Ok(result) = serde_json::from_slice::<T>(&body) {
            return Ok(result);
        }

        // Try to parse the result as E.
        if let Ok(result) = serde_json::from_slice::<E>(&body) {
            return Err(ApiClientError::ServiceError(result));
        }

        // If both failed, return the status_code and the body for the user to
        // debug.
        Err(ApiClientError::InvalidResponse(status_code, body))
    }

    /// Parse the `has_more_results` header from the response. If no header is
    /// found, or the value does not contain "true", then it will return false.
    fn parse_has_more_results_header(response: &Response) -> bool {
        response
            .headers()
            .get(HAS_MORE_RESULTS_KEY)
            .map_or(false, |value| {
                value
                    .to_str()
                    .map(|value| value.parse().unwrap_or_default())
                    .unwrap_or_default()
            })
    }

    /// Parse the `total_results` header from the response. If no header is
    /// found or an invalid number is found it will return None.
    fn parse_total_results_header(response: &Response) -> Option<u32> {
        response
            .headers()
            .get(TOTAL_RESULTS_KEY)
            .map(|value| value.to_str().ok().and_then(|value| value.parse().ok()))
            .unwrap_or_default()
    }
}
