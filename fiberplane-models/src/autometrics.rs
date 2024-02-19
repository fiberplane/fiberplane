#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use std::fmt::Debug;
use typed_builder::TypedBuilder;

/// A metric that contains metadata related to the application.
///
/// See also: https://github.com/autometrics-dev/autometrics-shared/blob/main/specs/autometrics_v1.0.0.md#build_info
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::autometrics")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct AutometricsBuildInfo {
    /// The version of the user's project.
    ///
    /// See also: https://github.com/autometrics-dev/autometrics-shared/blob/main/specs/autometrics_v1.0.0.md#version
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub version: Option<String>,

    /// The Git commit hash identifying the snapshot of the user's project.
    ///
    /// See also: https://github.com/autometrics-dev/autometrics-shared/blob/main/specs/autometrics_v1.0.0.md#commit
    #[builder(setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub commit: Option<String>,

    /// The Git branch of the user's project.
    ///
    /// See also: https://github.com/autometrics-dev/autometrics-shared/blob/main/specs/autometrics_v1.0.0.md#branch
    #[builder(setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub branch: Option<String>,

    /// The logical name of a service. This matches the
    /// [OpenTelemetry Service specification](https://github.com/open-telemetry/semantic-conventions/tree/main/specification/resource/semantic_conventions#service).
    ///
    /// See also: https://github.com/autometrics-dev/autometrics-shared/blob/main/specs/autometrics_v1.0.0.md#servicename
    #[builder(setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub service_name: Option<String>,

    /// The version of the Autometrics specification that the library targets.
    ///
    /// See also: https://github.com/autometrics-dev/autometrics-shared/blob/main/specs/autometrics_v1.0.0.md#autometricsversion
    #[builder(setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub autometrics_version: Option<String>,

    /// A URL to the user's project git or other SCM repository.
    ///
    /// See also: https://github.com/autometrics-dev/autometrics-shared/blob/main/specs/autometrics_v1.0.0.md#repositoryurl
    #[builder(setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub repository_url: Option<String>,

    /// A hint to which provider is being used to host the repository.
    ///
    /// See also: https://github.com/autometrics-dev/autometrics-shared/blob/main/specs/autometrics_v1.0.0.md#repositoryprovider
    #[builder(setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub repository_provider: Option<String>,
}

/// Representation of an individual Autometricized function.
#[derive(Clone, Debug, Deserialize, Eq, Ord, PartialEq, PartialOrd, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::autometrics")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct AutometricsFunction {
    /// The name of the function or method, exactly as it appears in the source code.
    ///
    /// See also: https://github.com/autometrics-dev/autometrics-shared/blob/main/specs/autometrics_v1.0.0.md#function
    #[builder(setter(into))]
    pub function: String,

    /// The fully-qualified module or file path of the function.
    ///
    /// See also: https://github.com/autometrics-dev/autometrics-shared/blob/main/specs/autometrics_v1.0.0.md#module
    #[builder(setter(into))]
    pub module: String,

    /// The logical name of a service. This matches the
    /// [OpenTelemetry Service specification](https://github.com/open-telemetry/semantic-conventions/tree/main/specification/resource/semantic_conventions#service).
    ///
    /// See also: https://github.com/autometrics-dev/autometrics-shared/blob/main/specs/autometrics_v1.0.0.md#servicename
    #[builder(setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub service_name: Option<String>,
}

/// Represents an individual function call to an Autometricized function.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::autometrics")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct AutometricsFunctionCall {
    /// The Autometrics function being called.
    #[serde(flatten)]
    pub function: AutometricsFunction,

    /// Whether the function executed successfully or errored.
    pub result: AutometricsFunctionCallResult,

    /// The name of the function that invoked the given function.
    ///
    /// See also: https://github.com/autometrics-dev/autometrics-shared/blob/main/specs/autometrics_v1.0.0.md#callerfunction
    #[builder(setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub caller_function: Option<String>,

    /// The module of the function that invoked the given function.
    ///
    /// See also: https://github.com/autometrics-dev/autometrics-shared/blob/main/specs/autometrics_v1.0.0.md#callermodule
    #[builder(setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub caller_module: Option<String>,

    /// The user-specified name of the objective, if an SLO is attached.
    ///
    /// May be an empty string, which also indicates that no SLO is attached.
    ///
    /// See also: https://github.com/autometrics-dev/autometrics-shared/blob/main/specs/autometrics_v1.0.0.md#objectivename
    #[builder(setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub objective_name: Option<String>,

    /// The percentage of requests that should have an `"ok"` result.
    ///
    /// Only present if an SLO is attached. May be an empty string, which also indicates that no SLO
    /// is attached.
    ///
    /// See also: https://github.com/autometrics-dev/autometrics-shared/blob/main/specs/autometrics_v1.0.0.md#objectivepercentile
    #[builder(setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub objective_percentile: Option<String>,
}

/// Represents the duration of an individual function call to an Autometricized function.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::autometrics")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct AutometricsFunctionCallDuration {
    /// The Autometrics function being called.
    #[serde(flatten)]
    pub function: AutometricsFunction,

    /// The user-specified name of the objective, if an SLO is attached.
    ///
    /// May be an empty string, which also indicates that no SLO is attached.
    ///
    /// See also: https://github.com/autometrics-dev/autometrics-shared/blob/main/specs/autometrics_v1.0.0.md#objectivename
    #[builder(setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub objective_name: Option<String>,

    /// The percentage of requests that should meet the SLO's `latency_threshold`.
    ///
    /// Only present if an SLO is attached. May be an empty string, which also indicates that no SLO
    /// is attached.
    ///
    /// See also: https://github.com/autometrics-dev/autometrics-shared/blob/main/specs/autometrics_v1.0.0.md#objectivepercentile
    #[builder(setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub objective_percentile: Option<String>,

    /// The percentage of requests that should meet the SLO's `latency_threshold`.
    ///
    /// Only present if an SLO is attached. May be an empty string, which also indicates that no SLO
    /// is attached.
    ///
    /// See also: https://github.com/autometrics-dev/autometrics-shared/blob/main/specs/autometrics_v1.0.0.md#objectivelatency_threshold
    #[builder(setter(into, strip_option))]
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub objective_latency_threshold: Option<String>,
}

/// Whether the function executed successfully or errored.
///
/// See also: https://github.com/autometrics-dev/autometrics-shared/blob/main/specs/autometrics_v1.0.0.md#result
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::autometrics")
)]
#[serde(rename_all = "snake_case")]
pub enum AutometricsFunctionCallResult {
    Ok,
    Error,
}

/// Schema for a Prometheus response to a query for Autometricized functions.
#[derive(Clone, Debug, Deserialize, PartialEq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::autometrics")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct PrometheusResponse<T> {
    pub status: PrometheusResponseStatus,

    #[builder(setter(into))]
    pub data: T,
}

/// Status reported by Prometheus.
#[derive(Clone, Debug, Deserialize, Eq, PartialEq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::autometrics")
)]
#[serde(rename_all = "snake_case")]
pub enum PrometheusResponseStatus {
    Error,
    Success,
}
