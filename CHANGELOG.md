# Changelog

All notable changes to this project will be documented in this file.

The format of this file is based on
[Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

Please note that while we use
[Semantic Versioning](https://semver.org/spec/v2.0.0.html) for the `fiberplane`
repository as a whole, individual crates published from this repo may skip
versions to stay in lockstep with the other crates. This means that individual
crates do not strictly follow _SemVer_ although their versioning remains
_compatible with_ SemVer, i.e. they will not contain breaking changes if the
major version hasn't changed.

## [v1.0.0-beta.13] - TBD

TBD

## [v1.0.0-beta.12] - 2024-02-23

- `API` schema: Add routes to manipulate the front matter collections in a workspace (a saved front matter
  schema with an attached name).
- `fiberplane-api-client`: Add methods to manipulate the front matter collections in a workspace.
- `fiberplane-api-client`: Pagination has been removed from the integrations listing endpoint (#171)

## [v1.0.0-beta.11] - 2024-02-08

- `fiberplane-models`: The `updated_at` and `created_at` fields in the `IntegrationSummary` struct are now optional (#171)

## [v1.0.0-beta.9] - 2024-02-05

- `fiberplane-models`: User schema for front-matter now has the multiple property, so multiple users can be selected
- `fiberplane-models`: Add a `front_matter_collections` key to the `NewNotebook` payload.
  The extra field will allow an extra way for templates to point to a front matter schema to
  expand into.
- `fiberplane-models`: Remove (short-lived, unused) `front_matter_schema_names` from `NewTemplate` and
  `UpdateTemplate` payloads. Consequence of the change above, templates will describe the front
  matter they use exclusively in their body now, not through extra API handling. Therefore the field
  is not necessary.
- `API` schema: Add routes to manipulate the front matter schema granularly.
- `fiberplane-api-client`: Add methods to manipulate the front matter schema granularly.
- `fiberplane-models`: Add structures to support the new front matter endpoints.
- `fiberplane-ui`: Reduce UI library theming complexity & add fallback values.
- `fiberplane-templates`: Add jsonnet functions in `fiberplane.libsonnet` to allow templates to manipulate
  front matter when creating a notebook.
  + `addFrontMatterCollection` and `addFrontMatterCollections` allow to add front matter entries according
    to (beta) front matter collections living in the workspace that the template is expanded into.
  + `addFrontMatterValue` and `AddFrontMatterValues` allow to add specific values to front matter entries
  + `addFrontMatterSchema` is an unstable function that allows to specify front matter entries to add
    to the notebook inplace. It is currently used to convert a notebook to a template while keeping the
    front matter information
- Add `fiberplane-hooks`: Add hook library shipping three initial hooks
  (`useHandler`, `useKeyPressEvent`, `useLocalStorage`, `useMedia`, `useThemeSwitch`)

## [v1.0.0-beta.8] - 2024-01-05

- `fiberplane-charts`: Export some util function and components related to
  zooming/dragging to facilitate a more experimental graph (alert timeline)
- `@fiberplane/ui`: Add initial setup component library & add `Button` component
- `@fiberplane/ui`: Add `Input` components
- `@fiberplane/ui`: Add `ThemeProvider`
- `@fiberplane/ui`: Add `Icon` component
- `@fiberplane/ui`: Upgrade `styled-components` to v6 & simplify `Button`
- `@fiberplane/ui`: Add webhooks icon & expose icon type guard
- `fiberplane-charts`: Allow configuring stroke width of chart content lines
- `mondrian-charts`: Allow configuring stroke width of chart content lines
- `fiberplane-models`: Add models and operations to interact with Front matter using
  "Front Matter Schema" structure.
  Each notebook has both a "front matter" (the raw data) and a "front matter schema",
  controlling the display and the properties of the front matter.
  Each workspace has a list of (editable) associated front matter schemas pickable when
  creating notebooks.
- `fiberplane-models`: Add `updated_at` to `SubscriberChangedFocusMessage`
- `fiberplane-api-client`: Add queries to work with front matter schemas associated with
  a workspace.
- `fiberplane-models`: Added various structs related to Integrations (#142)
- `fiberplane-api-client`: Added `integrations_list` endpoint (#142)

## [v1.0.0-beta.7] - 2023-11-30
## mondrian-charts [v0.4.0] - 2023-11-30

- `mondrian-charts`: Change Target Latency into a dotted line and support individual area gradients

## [v1.0.0-beta.6] - 2023-10-20

- `fiberplane-charts`: Fix issue where SparkCharts would still get some grid
  lines.
- `fiberplane-charts`: Fix issue where height wasn't set/stored correctly for
  legend items (especially relevant for items that span multiple lines)
- `fiberplane-charts`: Updated with `chartTheme` prop allowing extending styles
  of the charts (#95)
- `fiberplane-models`: Extended doc comments.

## [v1.0.0-beta.5] - 2023-06-14

- `fiberplane-models`: Added #[builder(default)] to Metric and OtelMetaData
  models

## [v1.0.0-beta.3] - 2023-06-14

**Breaking changes!** Some breaking changes occurred between beta versions.

### Added

- `fiberplane-models`: Added `other_field_data` field to `AutoSuggestRequest`.
  The field contains arbitrary other parts of the Provider Cell request data. It
  is meant to be used in providers to provide more refined suggestions by
  examining the context.
- `fiberplane-api-client`: Added new query parameters `sort_by` and
  `sort_direction` to the `notebook_search` endpoint (#27)
- `fiberplane-api-client`: Existing endpoint `pinned_views_get` now returns
  `Vec<View>` instead of `Vec<PinnedView>` (#27)
- `fiberplane-models`: Added optional field `relative_time` to NotebookSearch
  (#32)
- `fiberplane-models`: Added `TimelineCell` and `Timeline`, these types refer to
  a new cell type and the data it expects. (#28)
- `fiberplane-models`: Added `EventAddedMessage`, `EventUpdatedMessage`,
  `EventDeletedMessage` messages that can be sent to studio. (#28)
- `fiberplane-models`: Added `ArrayField` variant of `QueryField` to specify
  provider query schemas that include rows/records of arbitrary data. (#39)
- `fiberplane-models`: Added various structures for webhooks. (#41)
- `fiberplane-api-client`: Added new webhook endpoints. (#41)
- `fiberplane-models`: Added new field `successful` to `Webhook` and added new
  field `enabled` to `NewWebhook` struct (#54)
- `fiberplane-models`: Add `OidConnection(s)` models displaying linked
  connections to user accounts in preparation for Sign in with GitHub (#58)

### Changed

- `fiberplane-models`: Replaced `AutoSuggestRequest::from_query_data()` with
  `AutoSuggestRequest::parse()` for consistency with the PDK.
- Rename Event in the providers module to ProviderEvent (#26)
- `fiberplane-models`: `UpdateView` field `color` is now optional (#27)
- `fiberplane-models`: All `u32` fields declared within `Pagination` no longer
  use serde's built-in deserialization but a custom visitor. This is a
  workaround for a bug inside axum `Query` <-> serde impl:
  https://github.com/tokio-rs/axum/discussions/1359 (#27)
- `fiberplane-models`: `UpdateView` fields `description`, `relative_time`,
  `sort_by` and `sort_direction` now take an `Option<Option<T>>` instead of
  previously an `Option<T>`. (#31)
- `fiberplane-templates`: Well-known provider cells (`prometheus`, `loki`,
  `elasticsearch`) have their payloads converted to human-readable form when
  transformed into templates or snippets. (#34)
- `fiberplane-models`: Changed many function signatures to be more consistent in
  their usage of builders and how string arguments are accepted.

### Removed

- Support for the legacy provider protocol has been removed.
- `fiberplane-models`: The `PaginatedSearch` struct has been removed (#27)
- Removed the `title` and associated `formatting` fields from `ProviderCell`.
  The `title` argument for provider cells is still accepted in templates so as
  not to break any existing templates.

## [v1.0.0-beta.1] - 2023-02-14

### Added

- Add support for pinned views
- Initial open-source release of `fiberplane`.
