use serde::{Deserialize, Serialize, Serializer};
use std::ops::{Deref, DerefMut};
use std::slice::{Iter, IterMut};
use std::vec::IntoIter;
use typed_builder::TypedBuilder;

#[cfg(feature = "fp-bindgen")]
use fp_bindgen::prelude::Serializable;

#[cfg(feature = "axum_06")]
use {
    axum_06::http::{HeaderMap, HeaderValue},
    axum_06::response::{IntoResponse, Response},
    axum_06::Json,
};

/// HTTP header key that will be added on a list endpoint indicating whether
/// there are more results.
///
/// This header is optional and may not be present in every list endpoint.
///
/// Its values will be the literal string "true" if there are more results,
/// otherwise it will be "false" indicating that there are no more results. Any
/// other values should be treated the same as "false".
pub const HAS_MORE_RESULTS_KEY: &str = "FP-Has-More-Results";

/// HTTP header key that will be added on a list endpoint if it is known how
/// many results there are in total.
///
/// Note that this is an optional header. There is no guarantee that it will be
/// present in every list endpoint and can potentially be removed from any list
/// endpoint without notice.
///
/// The content of the value will be a unsigned 32 bit integer as a string.
pub const TOTAL_RESULTS_KEY: &str = "FP-Total-Results";

/// A PagedVec<T> wraps a regular Vec<T> but it also adds some metadata that
/// will set by the client. These values will parsed from the HTTP headers.
///
/// This type is not used directly as part of a response or request body, but
/// instead it is used by the fiberplane-api-client for endpoints that return
/// multiple items.
#[derive(Debug, PartialEq)]
pub struct PagedVec<T> {
    pub inner: Vec<T>,
    pub has_more_results: bool,
    pub total_results: Option<u32>,
}

impl<T> Deref for PagedVec<T> {
    type Target = Vec<T>;
    #[inline]
    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

impl<T> DerefMut for PagedVec<T> {
    #[inline]
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.inner
    }
}

impl<T> PagedVec<T> {
    pub fn page_amount(&self, pagination: &Pagination) -> Option<u32> {
        if !self.has_more_results {
            Some(pagination.page)
        } else {
            self.total_results.map(|results| results / pagination.limit)
        }
    }

    #[inline]
    pub fn iter(&self) -> Iter<'_, T> {
        self.inner.iter()
    }

    #[inline]
    pub fn iter_mut(&mut self) -> IterMut<'_, T> {
        self.inner.iter_mut()
    }

    #[inline]
    pub fn into_inner(self) -> Vec<T> {
        self.inner
    }

    /// Maps this `PagedVec<T>` to a `PagedVec<B>`, while maintaining the same
    /// values for `has_more_results` and `total_results`.
    pub fn map<B, F>(self, f: F) -> PagedVec<B>
    where
        F: FnMut(T) -> B,
    {
        PagedVec {
            inner: self.inner.into_iter().map(f).collect(),
            has_more_results: self.has_more_results,
            total_results: self.total_results,
        }
    }

    #[inline]
    pub fn into<B: From<T>>(self) -> PagedVec<B> {
        self.map(|value| Into::<B>::into(value))
    }

    #[cfg(feature = "axum_06")]
    pub fn unpack(self) -> (Vec<T>, HeaderMap) {
        let has_more_results = &self.has_more_results.to_string();
        let has_more_results = HeaderValue::from_str(has_more_results).unwrap(); // Safe because .to_string does not result in invalid ascii

        let mut map = HeaderMap::new();

        map.insert(HAS_MORE_RESULTS_KEY, has_more_results);
        if let Some(total_results) = self.total_results {
            let total_results = &total_results.to_string();
            let total_results = HeaderValue::from_str(total_results).unwrap(); // Safe because .to_string does not result in invalid ascii
            map.insert(TOTAL_RESULTS_KEY, total_results);
        }

        (self.inner, map)
    }
}

#[cfg(feature = "axum_06")]
impl<T> IntoResponse for PagedVec<T>
where
    T: Serialize,
    Json<Vec<T>>: IntoResponse,
{
    fn into_response(self) -> Response {
        let (results, headers) = self.unpack();
        (headers, Json(results)).into_response()
    }
}

impl<T> IntoIterator for PagedVec<T> {
    type Item = T;
    type IntoIter = IntoIter<Self::Item>;

    fn into_iter(self) -> Self::IntoIter {
        self.inner.into_iter()
    }
}

impl<T: Serialize> Serialize for PagedVec<T> {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        self.inner.serialize(serializer)
    }
}

/// A struct that represents the pagination of a list endpoint.
///
/// Some list endpoints support pagination by passing in querystring parameters,
/// which are `page` and `limit`. This Pagination object is used to be used
/// within api client when making a request.
///
/// Note that not all endpoints support pagination and some endpoints might
/// ignore values that are too high.
#[derive(Debug, Deserialize, Serialize, Clone, PartialEq, Eq, TypedBuilder)]
#[cfg_attr(
    feature = "fp-bindgen",
    derive(Serializable),
    fp(rust_module = "fiberplane_models::paging")
)]
#[non_exhaustive]
pub struct Pagination {
    #[serde(
        default = "Pagination::default_page",
        deserialize_with = "crate::deserialize_u32"
    )]
    pub page: u32,

    #[serde(
        default = "Pagination::default_limit",
        deserialize_with = "crate::deserialize_u32"
    )]
    pub limit: u32,
}

impl Pagination {
    #[inline]
    fn default_page() -> u32 {
        0
    }

    #[inline]
    fn default_limit() -> u32 {
        200
    }

    /// The number of items to return.
    pub fn limit(&self) -> i64 {
        self.limit as i64
    }

    /// The number of items to skip. This is the same as `page * limit`.
    pub fn offset(&self) -> i64 {
        self.page as i64 * self.limit as i64
    }

    /// Create a pagination that effectively fetches every item (since limit is
    /// set to the max value).
    ///
    /// Note that some endpoints might ignore setting this value this high.
    pub fn max() -> Self {
        Self {
            page: 0,
            limit: u32::MAX,
        }
    }
}

impl Default for Pagination {
    fn default() -> Self {
        Self {
            page: Pagination::default_page(),
            limit: Pagination::default_limit(),
        }
    }
}
