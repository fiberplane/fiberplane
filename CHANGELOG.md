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

- `fiberplane_models`: Added `other_field_data` field to `AutoSuggestRequest`.
  The field contains arbitrary other parts of the Provider Cell request data. It
  is meant to be used in providers to provide more refined suggestions by
  examining the context.

### Changed

- `fiberplane_models`: Replaced `AutoSuggestRequest::from_query_data()` with
  `AutoSuggestRequest::parse()` for consistency with the PDK.

### Removed

- Support for the legacy provider protocol has been removed.

## [v1.0.0-beta.1] - 2023-02-14

### Added

- Add support for pinned views
- Initial open-source release of `fiberplane`.
