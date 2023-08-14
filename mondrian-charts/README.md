# Mondrian Charts

[![Crates.io](https://img.shields.io/crates/v/mondrian-charts.svg)](https://crates.io/crates/mondrian-charts) [![Docs](https://docs.rs/mondrian-charts/badge.svg)](https://docs.rs/mondrian-charts)

> Abstract chart generator and renderer

Mondrian provides a set of types for *abstract charts*. An abstract chart
defines what a chart should look like, without going into the details of its
exact rendering. It allows for generating static images (everything you need for
that is in this crate), but can also be used as a source to generate interactive
charts using the
[`fiberplane-charts`](https://www.npmjs.com/package/@fiberplane/fiberplane-charts)
library. The latter also contains a full TypeScript implementation for
generating Mondrian charts.

This crate also comes with generators for creating Mondrian charts based on
*timeseries data* defined using
[`fiberplane-models`](https://crates.io/crates/fiberplane-models). That said,
the dependency on `fiberplane-models` is optional, so if you want to generate
Mondrian charts from your own data types, you can.

Finally, this crate features exporters for generating SVG and PNG images from
Mondrian charts, as well as other image formats supported by the
[`image`](https://crates.io/crates/image) crate.

## Why not use SVG?

Just like SVG, Mondrian is a declarative format that relies on a renderer for
the final visualization. So why not just use SVG?

* Mondrian is highly opinionated towards the use case of charts. While it uses
  abstract "SVG-like" shapes to represent the chart's content, it has
  chart-specific features such as axes with tick suggestions.
* Mondrian allows creating interactive charts by attaching metadata that can be
  used to make the axes draggable as well as to facilitate tooltips when
  hovering over shapes.

Other notable differences include:

* Coordinates in Mondrian charts are normalized to values ranging from 0.0
  through 1.0. This makes it very easy to render charts at any desired
  resolution by simply multiplying the coordinates with the desired width and
  height.
* Mondrian data types are typically serialized as JSON, although any format
  supported by `serde` can be used.

Finally, it bears mentioning that while Mondrian is a useful intermediary format
before rendering to a more concrete output, Mondrian charts can indeed be
serialized to SVG as well.

## Usage

See: https://docs.rs/mondrian-charts/latest/mondrian_charts

## Getting Help

Please see [COMMUNITY.md](../COMMUNITY.md) for ways to reach out to us.

## Contributing

Please follow our [Contributing Guidelines](../CONTRIBUTING.md) to learn how
best to contribute to this project.

## Code of Conduct

See [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md).

## License

This project is distributed under the terms of both the MIT license and the
Apache License (Version 2.0).

See [LICENSE-APACHE](../LICENSE-APACHE) and [LICENSE-MIT](../LICENSE-MIT).
