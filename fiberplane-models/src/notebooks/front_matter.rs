use crate::front_matter_schemas::SerializableEqFloat;
pub use crate::labels::Label;
use crate::timestamps::*;
use base64uuid::Base64Uuid;
#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::{collections::BTreeMap, str::FromStr};
use strum_macros::Display;
use thiserror::Error;
use typed_builder::TypedBuilder;

/// A JSON object which may or may not contain well known keys.
/// More information in the [RFC](https://www.notion.so/fiberplane/RFC-58-Front-matter-Specialization-Front-matter-a9b3b51614ee48a19ec416c02a9fd647)
///
/// The values stored in the FrontMatter can follow a schema to contain type information and be validated at
/// runtime by the corresponding [`FrontMatterSchemaEntry`](crate::front_matter_schemas::FrontMatterSchemaEntry).
///
/// See [`FrontMatterValue`] for more details on validation.
pub type FrontMatter = BTreeMap<String, FrontMatterValue>;

/// Known variants of front-matter values for runtime validation.
///
/// Front matter values can hold extra type information to allow the API and
/// the operational transform operations to validate values before storing them.
///
/// The usual pattern to use these values is to use the `validate_value` method
/// of `FrontMatterSchemaEntry` to check if the value has the expected type:
///
/// ```rust
/// # use fiberplane_models::front_matter_schemas::{FrontMatterSchemaEntry, FrontMatterNumberSchema};
/// # use serde_json::json;
/// // An existing schema to check values against
/// let schema = FrontMatterSchemaEntry::builder()
///     .key("foo")
///     .schema(FrontMatterNumberSchema::builder()
///         .display_name("A number field that accepts single numbers")
///         .build())
///     .build();
///
/// // A value that came from an API boundary
/// let good_value_from_api = json!(42);
/// assert!(schema.validate_value(good_value_from_api).is_ok());
///
/// // Another value (that has the wrong type)
/// let bad_value_from_api = json!("2022-10-08T13:29:00.78Z");
/// assert!(schema.validate_value(bad_value_from_api).is_err());
/// ```
///
/// This can be used to validate the obtained value format.
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, Display)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[serde(untagged)]
pub enum FrontMatterValue {
    /// A timestamp front matter value
    DateTime(FrontMatterDateTimeValue),
    /// A list-of-timestamps front matter value
    DateTimeList(FrontMatterDateTimeList),

    /// A user front matter value
    User(FrontMatterUserValue),
    /// A list-of-users front matter value
    UserList(FrontMatterUserList),

    /// A string front matter value
    String(FrontMatterStringValue),
    /// A list-of-strings front matter value
    StringList(FrontMatterStringList),

    /// A number front matter value
    Number(FrontMatterNumberValue),
    /// A list-of-numbers front matter value
    NumberList(FrontMatterNumberList),

    /// A PagerDuty incident front matter value
    #[serde(rename = "pagerduty_incident")]
    PagerDutyIncident(Box<FrontMatterPagerDutyIncident>),

    /// A GitHub pull request front matter value
    #[serde(rename = "github_pull_request")]
    GitHubPullRequest(Box<FrontMatterGitHubPullRequest>),
}

/// Error from validating a JSON object as a correct front matter value
#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, Error)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum FrontMatterValidationError {
    /// Impossible to deserialize the data
    #[error("unexpected format: {message}")]
    Format { message: String },

    /// Obtained the wrong variant
    #[error("unexpected variant: expected {expected} but got {got}")]
    Variant { got: String, expected: String },
}

impl FrontMatterValidationError {
    pub(crate) fn wrong_variant(got: &str, expected: &str) -> Self {
        Self::Variant {
            got: got.to_string(),
            expected: expected.to_string(),
        }
    }
}

impl From<serde_json::Value> for FrontMatterValue {
    fn from(value: serde_json::Value) -> Self {
        serde_json::from_value(value)
            .expect("with the untagged variant, all serde_json::Value are deserializable.")
    }
}

impl TryFrom<&str> for FrontMatterValue {
    type Error = FrontMatterValidationError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        serde_json::from_str(value).map_err(|err| FrontMatterValidationError::Format {
            message: err.to_string(),
        })
    }
}

impl FrontMatterValue {
    /// Get a string description of the type of the value
    pub fn get_type(&self) -> &'static str {
        match self {
            FrontMatterValue::Number(_) => "number",
            FrontMatterValue::NumberList(_) => "number_list",
            FrontMatterValue::String(_) => "string",
            FrontMatterValue::StringList(_) => "string_list",
            FrontMatterValue::DateTime(_) => "date_time",
            FrontMatterValue::DateTimeList(_) => "date_time_list",
            FrontMatterValue::User(_) => "user",
            FrontMatterValue::UserList(_) => "user_list",
            FrontMatterValue::PagerDutyIncident(_) => "pagerduty_incident",
            FrontMatterValue::GitHubPullRequest(_) => "github_pull_request",
        }
    }
}

impl TryFrom<serde_json::Value> for FrontMatterNumberValue {
    type Error = FrontMatterValidationError;

    fn try_from(value: serde_json::Value) -> Result<Self, Self::Error> {
        if let Value::Number(num) = value {
            return Ok(Self(
                num.as_f64()
                    .ok_or_else(|| FrontMatterValidationError::Format {
                        message: "invalid number".to_string(),
                    })?
                    .into(),
            ));
        }

        Err(FrontMatterValidationError::wrong_variant(
            "untyped", "number",
        ))
    }
}

impl From<f64> for FrontMatterNumberValue {
    fn from(value: f64) -> Self {
        Self(value.into())
    }
}

impl TryFrom<serde_json::Value> for FrontMatterNumberList {
    type Error = FrontMatterValidationError;

    fn try_from(value: serde_json::Value) -> Result<Self, Self::Error> {
        if let Value::Array(array) = value {
            return Ok(Self(
                array
                    .into_iter()
                    .map(FrontMatterNumberValue::try_from)
                    .collect::<Result<Vec<_>, _>>()?,
            ));
        }

        Err(FrontMatterValidationError::wrong_variant(
            "'not a list'",
            "number_list",
        ))
    }
}

impl TryFrom<serde_json::Value> for FrontMatterStringValue {
    type Error = FrontMatterValidationError;

    fn try_from(value: serde_json::Value) -> Result<Self, Self::Error> {
        if let Value::String(strr) = value {
            return Ok(Self(strr));
        }

        Err(FrontMatterValidationError::wrong_variant(
            "untyped", "string",
        ))
    }
}

impl From<&str> for FrontMatterStringValue {
    fn from(value: &str) -> Self {
        Self(value.to_string())
    }
}

impl From<String> for FrontMatterStringValue {
    fn from(value: String) -> Self {
        Self(value)
    }
}

impl TryFrom<serde_json::Value> for FrontMatterStringList {
    type Error = FrontMatterValidationError;

    fn try_from(value: serde_json::Value) -> Result<Self, Self::Error> {
        if let Value::Array(array) = value {
            return Ok(Self(
                array
                    .into_iter()
                    .map(FrontMatterStringValue::try_from)
                    .collect::<Result<Vec<_>, _>>()?,
            ));
        }

        Err(FrontMatterValidationError::wrong_variant(
            "'not a list'",
            "string_list",
        ))
    }
}

impl TryFrom<serde_json::Value> for FrontMatterDateTimeValue {
    type Error = FrontMatterValidationError;

    fn try_from(value: serde_json::Value) -> Result<Self, Self::Error> {
        if let Value::String(strr) = value {
            return Ok(Self(strr.parse().map_err(|err| {
                FrontMatterValidationError::Format {
                    message: format!("invalid timestamp: {err}"),
                }
            })?));
        }

        Err(FrontMatterValidationError::wrong_variant(
            "untyped",
            "date_time",
        ))
    }
}

impl TryFrom<&str> for FrontMatterDateTimeValue {
    type Error = FrontMatterValidationError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        let value = Timestamp::parse(value).map_err(|err| FrontMatterValidationError::Format {
            message: err.to_string(),
        })?;
        Ok(Self(value))
    }
}

impl FromStr for FrontMatterDateTimeValue {
    type Err = FrontMatterValidationError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::try_from(s)
    }
}

impl TryFrom<serde_json::Value> for FrontMatterDateTimeList {
    type Error = FrontMatterValidationError;

    fn try_from(value: serde_json::Value) -> Result<Self, Self::Error> {
        if let Value::Array(array) = value {
            return Ok(Self(
                array
                    .into_iter()
                    .map(FrontMatterDateTimeValue::try_from)
                    .collect::<Result<Vec<_>, _>>()?,
            ));
        }

        Err(FrontMatterValidationError::wrong_variant(
            "'not a list'",
            "date_time_list",
        ))
    }
}

impl TryFrom<serde_json::Value> for FrontMatterUserValue {
    type Error = FrontMatterValidationError;

    fn try_from(value: serde_json::Value) -> Result<Self, Self::Error> {
        serde_json::from_value(value).map_err(|err| FrontMatterValidationError::Format {
            message: format!("invalid user: {err}"),
        })
    }
}

impl TryFrom<&str> for FrontMatterUserValue {
    type Error = FrontMatterValidationError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        let value =
            Base64Uuid::parse_str(value).map_err(|err| FrontMatterValidationError::Format {
                message: err.to_string(),
            })?;
        Ok(Self::from(value))
    }
}

impl FromStr for FrontMatterUserValue {
    type Err = FrontMatterValidationError;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        Self::try_from(s)
    }
}

impl TryFrom<serde_json::Value> for FrontMatterUserList {
    type Error = FrontMatterValidationError;

    fn try_from(value: serde_json::Value) -> Result<Self, Self::Error> {
        if let Value::Array(array) = value {
            return Ok(Self(
                array
                    .into_iter()
                    .map(FrontMatterUserValue::try_from)
                    .collect::<Result<Vec<_>, _>>()?,
            ));
        }

        Err(FrontMatterValidationError::wrong_variant(
            "'not a list'",
            "user_list",
        ))
    }
}

impl From<FrontMatterUserValue> for FrontMatterValue {
    fn from(v: FrontMatterUserValue) -> Self {
        Self::User(v)
    }
}

impl From<FrontMatterDateTimeValue> for FrontMatterValue {
    fn from(v: FrontMatterDateTimeValue) -> Self {
        Self::DateTime(v)
    }
}

impl From<FrontMatterStringValue> for FrontMatterValue {
    fn from(v: FrontMatterStringValue) -> Self {
        Self::String(v)
    }
}

impl From<FrontMatterNumberValue> for FrontMatterValue {
    fn from(v: FrontMatterNumberValue) -> Self {
        Self::Number(v)
    }
}

impl From<FrontMatterUserList> for FrontMatterValue {
    fn from(v: FrontMatterUserList) -> Self {
        Self::UserList(v)
    }
}

impl From<FrontMatterDateTimeList> for FrontMatterValue {
    fn from(v: FrontMatterDateTimeList) -> Self {
        Self::DateTimeList(v)
    }
}

impl From<FrontMatterStringList> for FrontMatterValue {
    fn from(v: FrontMatterStringList) -> Self {
        Self::StringList(v)
    }
}

impl From<FrontMatterNumberList> for FrontMatterValue {
    fn from(v: FrontMatterNumberList) -> Self {
        Self::NumberList(v)
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[repr(transparent)]
pub struct FrontMatterNumberValue(pub SerializableEqFloat);

impl std::ops::DerefMut for FrontMatterNumberValue {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

impl std::ops::Deref for FrontMatterNumberValue {
    type Target = SerializableEqFloat;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[repr(transparent)]
pub struct FrontMatterNumberList(pub Vec<FrontMatterNumberValue>);

impl std::ops::DerefMut for FrontMatterNumberList {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

impl std::ops::Deref for FrontMatterNumberList {
    type Target = Vec<FrontMatterNumberValue>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[repr(transparent)]
pub struct FrontMatterStringValue(pub String);

impl std::ops::DerefMut for FrontMatterStringValue {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

impl std::ops::Deref for FrontMatterStringValue {
    type Target = String;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[repr(transparent)]
pub struct FrontMatterStringList(pub Vec<FrontMatterStringValue>);

impl std::ops::DerefMut for FrontMatterStringList {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

impl std::ops::Deref for FrontMatterStringList {
    type Target = Vec<FrontMatterStringValue>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[repr(transparent)]
pub struct FrontMatterDateTimeValue(pub Timestamp);

impl std::ops::DerefMut for FrontMatterDateTimeValue {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

impl std::ops::Deref for FrontMatterDateTimeValue {
    type Target = Timestamp;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl<T: Into<Timestamp>> From<T> for FrontMatterDateTimeValue {
    fn from(value: T) -> Self {
        Self(value.into())
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[repr(transparent)]
pub struct FrontMatterDateTimeList(pub Vec<FrontMatterDateTimeValue>);

impl std::ops::DerefMut for FrontMatterDateTimeList {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

impl std::ops::Deref for FrontMatterDateTimeList {
    type Target = Vec<FrontMatterDateTimeValue>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[serde(rename_all = "snake_case")]
pub struct FrontMatterUserValue {
    #[builder(setter(into))]
    pub id: Base64Uuid,
    #[builder(setter(into))]
    pub name: String,
}

impl std::ops::DerefMut for FrontMatterUserValue {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.id
    }
}

impl std::ops::Deref for FrontMatterUserValue {
    type Target = Base64Uuid;

    fn deref(&self) -> &Self::Target {
        &self.id
    }
}

impl From<Base64Uuid> for FrontMatterUserValue {
    fn from(value: Base64Uuid) -> Self {
        Self {
            id: value,
            name: String::new(),
        }
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[repr(transparent)]
pub struct FrontMatterUserList(pub Vec<FrontMatterUserValue>);

impl std::ops::DerefMut for FrontMatterUserList {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.0
    }
}

impl std::ops::Deref for FrontMatterUserList {
    type Target = Vec<FrontMatterUserValue>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct FrontMatterPagerDutyIncident {
    /// Unique incident ID
    pub incident_id: String,

    /// User friendly identifier for the incident
    pub number: u64,

    /// Title as indicated by PagerDuty
    pub title: String,

    /// The status of the incident
    pub status: String,

    /// The date the incident was created
    #[builder(default = Timestamp::now_utc(), setter(into))]
    pub created_at: Timestamp,

    /// Timestamp that the PagerDuty receiver was last updated.
    #[builder(default = Timestamp::now_utc(), setter(into))]
    pub updated_at: Timestamp,

    /// Timestamp when this incident was resolved
    #[builder(default, setter(into))]
    pub resolved_at: Option<Timestamp>,

    /// URL to the incident api endpoint
    pub api_url: String,

    /// URL to the incident web page
    pub html_url: String,

    /// The incident key is used to deduplicate incidents.
    pub incident_key: String,

    /// The service that the incident is associated with
    #[builder(default, setter(into))]
    pub service: Option<PagerDutyResourceReference>,

    #[builder(default, setter(into))]
    pub escalation_policy: Option<PagerDutyResourceReference>,

    #[builder(default, setter(into))]
    pub priority: Option<PagerDutyResourceReference>,

    #[builder(default, setter(into))]
    pub urgency: Option<String>,

    #[builder(default, setter(into))]
    pub resolve_reason: Option<String>,

    #[builder(default, setter(into))]
    pub assignees: Vec<String>,

    #[builder(default, setter(into))]
    pub teams: Vec<String>,
}

impl From<FrontMatterPagerDutyIncident> for FrontMatterValue {
    fn from(v: FrontMatterPagerDutyIncident) -> Self {
        Self::PagerDutyIncident(Box::new(v))
    }
}

impl TryFrom<serde_json::Value> for FrontMatterPagerDutyIncident {
    type Error = FrontMatterValidationError;

    fn try_from(value: serde_json::Value) -> Result<Self, Self::Error> {
        serde_json::from_value(value).map_err(|err| FrontMatterValidationError::Format {
            message: format!("invalid pagerduty incident: {err}"),
        })
    }
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct PagerDutyResourceReference {
    pub id: String,
    pub summary: String,
    pub api_url: String,
    pub html_url: String,

    #[serde(rename = "type")]
    pub ty: PagerDutyResourceReferenceType,
}

#[derive(Clone, Copy, Debug, Deserialize, PartialEq, Eq, Serialize, Display)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
pub enum PagerDutyResourceReferenceType {
    EscalationPolicy,
    Incident,
    IncidentWorkflow,
    Priority,
    Service,
    Team,
    User,
    WorkflowTrigger,
}

#[derive(Clone, Debug, Deserialize, PartialEq, Eq, Serialize, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::notebooks::front_matter")
)]
#[non_exhaustive]
#[serde(rename_all = "camelCase")]
pub struct FrontMatterGitHubPullRequest {
    /// HTML url of this GitHub pull request
    pub html_url: String,

    /// Global unique ID of the GitHub pull request. GitHub assigns this ID.
    pub id: u64,

    /// The owner of the repository where this pull request was created on
    #[builder(setter(into))]
    pub repo_owner: String,

    /// The name of the repository where this pull request was created on
    #[builder(setter(into))]
    pub repo_name: String,

    /// The pull request number within this repository. Please note that GitHub
    /// treats pull request and issue numbers as the same
    pub number: u64,

    /// Title of the pull request
    #[builder(setter(into))]
    pub title: String,

    /// Branch name of this PR
    #[builder(setter(into))]
    pub branch: String,

    /// Amount of commits in this PR
    pub commits: u64,

    /// Creator of the pull request
    #[builder(setter(into))]
    pub author: String,

    /// GitHub Avatar URL of the author
    #[builder(setter(into))]
    pub author_avatar_url: String,

    /// Assignee of this pull request
    #[builder(setter(into))]
    pub assignee: Option<String>,

    /// GitHub avatar URL of the assignee
    #[builder(setter(into))]
    pub assignee_avatar_url: Option<String>,

    /// Labels attached to this pull request
    pub labels: Vec<String>,

    /// Reviewers requested for this pull request
    pub reviewers: Vec<String>,

    /// State of the pull request
    #[builder(setter(into))]
    pub state: String,

    /// Whenever the pull request is a draft
    pub draft: bool,

    /// Whenever the pull request was merged
    pub merged: bool,

    /// Timestamp when this pull request was created
    #[builder(setter(into))]
    pub created_at: Timestamp,

    /// Timestamp of the last update made to this pull request. Please note that
    /// this includes both changes made to the pull request (e.g label added)
    /// as well as actual code changes
    #[builder(setter(into))]
    pub updated_at: Timestamp,
}

impl From<FrontMatterGitHubPullRequest> for FrontMatterValue {
    fn from(v: FrontMatterGitHubPullRequest) -> Self {
        Self::GitHubPullRequest(Box::new(v))
    }
}

impl TryFrom<Value> for FrontMatterGitHubPullRequest {
    type Error = FrontMatterValidationError;

    fn try_from(value: Value) -> Result<Self, Self::Error> {
        serde_json::from_value(value).map_err(|err| FrontMatterValidationError::Format {
            message: format!("invalid github pull request: {err}"),
        })
    }
}
