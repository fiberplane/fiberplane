/*!
# Mondrian Charts

## Representation

A Mondrian chart is represented using the [`MondrianChart<S, P>`] type. This
type has two generic arguments, `S` and `P`:

* `S` refers to the type of series data from which the chart was generated.
* `P` refers to the type of data points from which the chart was generated.

Within the chart are shape lists (one for each series of type `S`), which are
used to contain shapes. [Shapes](Shape) are used to visualize data points,
although it differs per type of shape whether that shape is used to represent a
single data point or multiple.

Whenever a chart is rendered to its output format, all the shapes in a given
shape list are usually rendered in the same color. If you want to render a
legend along with the chart, a single shape list would correspond to a single
item in the legend.

X and Y axis of a chart are represented using the [`Axis`] type.

## Generation

To generate Mondrian charts, use the [`generate()`] or
[`generate_from_timeseries()`] functions.

Currently, this crate only contains generators to create charts from
[Fiberplane data types](fiberplane_models), although we welcome contributions to
generate charts from other types.

## Rendering

Use the [`chart_to_image()`] function to render a static image file, such as
a PNG file. All image formats from the [`image`] crate are supported.

Charts can also be serialized to SVG using the [`chart_to_svg()`] function.
Currently, all images are first converted to SVG before being rendered to a
binary format, although this may change in the future.

## Features

This crate offers the following feature flags, all of which are enabled by
default:

* **`fiberplane`**: Supports generating charts from Fiberplane data type.
* **`image`**: Supports rendering charts to static images, such as PNGs.
* **`svg`**: Supports serializing charts to SVG strings.

*/

mod types;
pub use types::*;

#[cfg(feature = "image")]
mod chart_to_image;
#[cfg(feature = "image")]
pub use chart_to_image::*;

#[cfg(feature = "svg")]
mod chart_to_svg;
#[cfg(feature = "svg")]
pub use chart_to_svg::*;

#[cfg(feature = "fiberplane")]
mod fiberplane;
#[cfg(feature = "fiberplane")]
pub use fiberplane::*;
