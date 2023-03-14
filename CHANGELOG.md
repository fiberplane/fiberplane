# Changelog

All notable changes to this project will be documented in this file.

The format of this file is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

Please note that while we use [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
for the `fiberplane` repository as a whole, individual crates published from
this repo may skip versions to stay in lockstep with the other crates. This
means that individual crates do not strictly follow _SemVer_ although their
versioning remains _compatible with_ SemVer, i.e. they will not contain breaking
changes if the major version hasn't changed.

## [Unreleased]

**Breaking changes!** Some breaking changes occurred between beta versions.

### Added

- `fiberplane-models`: Added `other_field_data` field to `AutoSuggestRequest`.
  The field contains arbitrary other parts of the Provider Cell request data. It
  is meant to be used in providers to provide more refined suggestions by
  examining the context.
- `fiberplane-api-client`: Added new query parameters `sort_by` and `sort_direction`
  to the `notebook_search` endpoint (#27)
- `fiberplane-api-client`: Existing endpoint `pinned_views_get` now returns `Vec<View>`
  instead of `Vec<PinnedView>` (#27)
- `fiberplane-models`: Added optional field `relative_time` to NotebookSearch (#32)

### Changed

- `fiberplane-models`: Replaced `AutoSuggestRequest::from_query_data()` with
  `AutoSuggestRequest::parse()` for consistency with the PDK.
- Rename Event in the providers module to ProviderEvent (#26)
- `fiberplane-models`: `UpdateView` field `color` is now optional (#27)
- `fiberplane-models`: All `u32` fields declared within `Pagination` no longer use
  serde's built-in deserialization but a custom visitor. This is a workaround for a
  bug inside axum `Query` <-> serde impl: https://github.com/tokio-rs/axum/discussions/1359 (#27)
- `fiberplane-models`: `UpdateView` fields `description`, `relative_time`, `sort_by`
  and `sort_direction` now take an `Option<Option<T>>` instead of previously an `Option<T>`. (#31)

### Removed

- Support for the legacy provider protocol has been removed.
- `fiberplane-models`: The `PaginatedSearch` struct has been removed (#27)

## [v1.0.0-beta.1] - 2023-02-14

### Added

- Add support for pinned views
- Initial open-source release of `fiberplane`.
