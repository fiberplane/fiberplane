use fiberplane::protocols::core::PrometheusDataSource;
use fp_provider_bindings::{
    LegacyProviderRequest as ProviderRequest, LegacyProviderResponse as ProviderResponse, *,
};
use serde::Deserialize;
use std::{
    collections::{BTreeMap, HashMap},
    num::ParseFloatError,
    time::{Duration, SystemTime},
};
use time::{format_description::well_known::Rfc3339, OffsetDateTime};
use url::Url;

const ONE_MINUTE: u32 = 60; // seconds
const ONE_HOUR: u32 = 60 * ONE_MINUTE; // seconds

#[fp_export_impl(fp_provider_bindings)]
async fn invoke(request: ProviderRequest, config: rmpv::Value) -> ProviderResponse {
    log(format!(
        "prometheus provider invoked with request: {:?}, config: {:?}",
        request, config
    ));

    let url = match rmpv::ext::from_value(config) {
        Ok(PrometheusDataSource { url }) => url,
        Err(err) => {
            return ProviderResponse::Error {
                error: Error::Config {
                    message: format!("Error parsing config: {:?}", err),
                },
            }
        }
    };

    match request {
        ProviderRequest::Instant(query) => fetch_instant(query, url)
            .await
            .map(|instants| ProviderResponse::Instant { instants })
            .unwrap_or_else(|error| ProviderResponse::Error { error }),
        ProviderRequest::Series(query) => fetch_series(query, url)
            .await
            .map(|series| ProviderResponse::Series { series })
            .unwrap_or_else(|error| ProviderResponse::Error { error }),
        ProviderRequest::AutoSuggest => fetch_suggestions(url)
            .await
            .map(|suggestions| ProviderResponse::AutoSuggest { suggestions })
            .unwrap_or_else(|error| ProviderResponse::Error { error }),
        ProviderRequest::Status => check_status(&url)
            .await
            .map(|_| ProviderResponse::StatusOk)
            .unwrap_or_else(|error| ProviderResponse::Error { error }),
        request => {
            log(format!(
                "prometheus provider got unsupported request type: {:?}",
                request
            ));
            ProviderResponse::Error {
                error: Error::UnsupportedRequest,
            }
        }
    }
}

async fn fetch_instant(request: QueryInstant, url: String) -> Result<Vec<Instant>, Error> {
    let mut form_data = form_urlencoded::Serializer::new(String::new());
    form_data.append_pair("query", &request.query);
    form_data.append_pair("time", &to_iso_date(request.timestamp));

    let mut headers = HashMap::new();
    headers.insert(
        "Content-Type".to_owned(),
        "application/x-www-form-urlencoded".to_owned(),
    );

    let url = format!("{}/api/v1/query", url);
    log(format!(
        "prometheus provider fetching instant from: {}, query: {}",
        &url, &request.query
    ));

    let result = make_http_request(HttpRequest {
        body: Some(form_data.finish().into()),
        headers: Some(headers),
        method: HttpRequestMethod::Post,
        url,
    })
    .await;
    match result {
        Ok(response) => from_vector(&response.body),
        Err(error) => Err(Error::Http { error }),
    }
}

async fn fetch_series(request: QueryTimeRange, url: String) -> Result<Vec<Series>, Error> {
    let step = step_for_range(&request.time_range);
    let start = to_iso_date(round_to_grid(
        request.time_range.from,
        step,
        RoundToGridEdge::Start,
    ));
    let end = to_iso_date(round_to_grid(
        request.time_range.to,
        step,
        RoundToGridEdge::End,
    ));

    let mut form_data = form_urlencoded::Serializer::new(String::new());
    form_data.append_pair("query", &request.query);
    form_data.append_pair("start", &start);
    form_data.append_pair("end", &end);
    form_data.append_pair("step", &step.to_string());

    let mut headers = HashMap::new();
    headers.insert(
        "Content-Type".to_owned(),
        "application/x-www-form-urlencoded".to_owned(),
    );

    let url = format!("{}/api/v1/query_range", url);
    log(format!(
        "prometheus provider fetching series from: {}, query: {}",
        &url, &request.query
    ));

    let result = make_http_request(HttpRequest {
        body: Some(form_data.finish().into()),
        headers: Some(headers),
        method: HttpRequestMethod::Post,
        url,
    })
    .await;
    match result {
        Ok(response) => from_matrix(&response.body),
        Err(error) => Err(Error::Http { error }),
    }
}

async fn fetch_suggestions(url: String) -> Result<Vec<Suggestion>, Error> {
    let url = format!("{}/api/v1/metadata", url);

    let result = make_http_request(HttpRequest {
        body: None,
        headers: None,
        method: HttpRequestMethod::Get,
        url,
    })
    .await;
    match result {
        Ok(response) => from_metadata(&response.body),
        Err(error) => Err(Error::Http { error }),
    }
}

async fn check_status(url: &str) -> Result<(), Error> {
    let mut url = Url::parse(url).map_err(|e| Error::Config {
        message: format!("Invalid prometheus URL: {:?}", e),
    })?;

    // Send a fake query to the query endpoint to check if we can connect to the Prometheus instance
    // We should get a 200 response even though it won't return any data
    url.path_segments_mut()
        .map_err(|_| Error::Config {
            message: "Invalid prometheus URL: cannot-be-a-base".to_string(),
        })?
        .push("api")
        .push("v1")
        .push("query");
    url.query_pairs_mut()
        .append_pair("query", "fiberplane_check_status");

    make_http_request(HttpRequest {
        body: None,
        headers: None,
        method: HttpRequestMethod::Get,
        url: url.to_string(),
    })
    .await
    .map_err(|error| Error::Http { error })?;

    Ok(())
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct PrometheusResponse {
    data: PrometheusData,
}

#[derive(Deserialize)]
#[serde(tag = "resultType", content = "result", rename_all = "snake_case")]
enum PrometheusData {
    Vector(Vec<InstantVector>),
    Matrix(Vec<RangeVector>),
}

#[derive(Deserialize)]
struct InstantVector {
    metric: HashMap<String, String>,
    value: PrometheusPoint,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct PrometheusMetadataResponse {
    data: BTreeMap<String, Vec<Metadata>>,
}

#[derive(Deserialize)]
struct Metadata {
    help: Option<String>,
}

#[derive(Deserialize)]
struct RangeVector {
    metric: HashMap<String, String>,
    values: Vec<PrometheusPoint>,
}

#[derive(Deserialize)]
struct PrometheusPoint(f64, String);

fn from_vector(response: &[u8]) -> Result<Vec<Instant>, Error> {
    let response = match serde_json::from_slice::<PrometheusResponse>(response)
        .map(|response| response.data)
    {
        Ok(PrometheusData::Vector(response)) => Ok(response),
        Ok(_) => Err(Error::Data {
            message: "Unexpected response type".to_owned(),
        }),
        Err(error) => Err(Error::Data {
            message: format!("Error parsing response: {}", error),
        }),
    }?;

    response
        .into_iter()
        .map(|instant| {
            let metric = to_metric(instant.metric);
            let point = to_point(instant.value)?;
            Ok(Instant { metric, point })
        })
        .collect::<Result<Vec<_>, ParseFloatError>>()
        .map_err(|error| Error::Data {
            message: format!("Error parsing response: {}", error),
        })
}

fn from_matrix(response: &[u8]) -> Result<Vec<Series>, Error> {
    let response = match serde_json::from_slice::<PrometheusResponse>(response)
        .map(|response| response.data)
    {
        Ok(PrometheusData::Matrix(response)) => Ok(response),
        Ok(_) => Err(Error::Data {
            message: "Unexpected response type".to_owned(),
        }),
        Err(error) => Err(Error::Data {
            message: format!("Error parsing response: {}", error),
        }),
    }?;

    response
        .into_iter()
        .map(|range| {
            let metric = to_metric(range.metric);
            let points = range
                .values
                .into_iter()
                .map(to_point)
                .collect::<Result<Vec<_>, ParseFloatError>>()?;
            Ok(Series {
                metric,
                points,
                visible: false,
            })
        })
        .collect::<Result<Vec<_>, ParseFloatError>>()
        .map_err(|error| Error::Data {
            message: format!("Error parsing response: {}", error),
        })
}

fn from_metadata(response: &[u8]) -> Result<Vec<Suggestion>, Error> {
    let response = match serde_json::from_slice::<PrometheusMetadataResponse>(response) {
        Ok(response) => response.data,
        Err(error) => {
            return Err(Error::Data {
                message: format!("Error parsing response: {}", error),
            })
        }
    };

    Ok(response
        .into_iter()
        .filter_map(|(name, values)| {
            values.into_iter().next().map(|value| Suggestion {
                text: name,
                description: value.help,
            })
        })
        .collect())
}

#[derive(Clone, Copy)]
struct StepSize {
    amount: u32,
    unit: StepUnit,
}

impl ToString for StepSize {
    fn to_string(&self) -> String {
        format!("{}{}", self.amount, self.unit.to_str())
    }
}

#[derive(Clone, Copy)]
enum StepUnit {
    Hours,
    Minutes,
    Seconds,
}

impl StepUnit {
    fn to_str(self) -> &'static str {
        match self {
            Self::Hours => "h",
            Self::Minutes => "m",
            Self::Seconds => "s",
        }
    }
}

enum RoundToGridEdge {
    Start,
    End,
}

/// Rounds the timestamp to a "grid" with intervals defined by the step size.
/// This assures that when we scroll a chart forward or backward in time, we
/// "snap" to the same grid, to avoid the issue of bucket realignment, giving
/// unexpected jumps in the graph.
fn round_to_grid(timestamp: Timestamp, step: StepSize, edge: RoundToGridEdge) -> Timestamp {
    let step_seconds = step_to_seconds(step);
    let round = match edge {
        RoundToGridEdge::Start => f64::floor,
        RoundToGridEdge::End => f64::ceil,
    };
    round(timestamp / step_seconds as f64) * step_seconds as f64
}

fn step_to_seconds(step: StepSize) -> u32 {
    match step.unit {
        StepUnit::Hours => ONE_HOUR * step.amount,
        StepUnit::Minutes => ONE_MINUTE * step.amount,
        StepUnit::Seconds => step.amount,
    }
}

/// Returns the step to fetch from the given duration in seconds. We attempt
/// to maintain roughly 30 steps for whatever the duration is, so that for a
/// duration of one hour, we fetch per 2 minutes, and for a duration of one
/// minute, we fetch per 2 seconds.
fn step_for_range(range: &TimeRange) -> StepSize {
    let mut step = (range.to - range.from) / 30.0;
    let mut unit = StepUnit::Seconds;
    if step >= 60.0 {
        step /= 60.0;
        unit = StepUnit::Minutes;
        if step >= 60.0 {
            step /= 60.0;
            unit = StepUnit::Hours;
        }
    }

    StepSize {
        amount: f64::ceil(2.0 * step) as u32,
        unit,
    }
}

fn to_iso_date(timestamp: Timestamp) -> String {
    let time = SystemTime::UNIX_EPOCH + Duration::from_millis((timestamp * 1000.0) as u64);
    OffsetDateTime::from(time)
        .format(&Rfc3339)
        .expect("Error formatting timestamp as RFC3339 timestamp")
}

fn to_metric(mut labels: HashMap<String, String>) -> Metric {
    let name = labels.remove("__name__").unwrap_or_else(|| "".to_owned());
    Metric { name, labels }
}

fn to_point(value: PrometheusPoint) -> Result<Point, ParseFloatError> {
    Ok(Point {
        timestamp: value.0,
        value: value.1.parse()?,
    })
}