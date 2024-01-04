/*!
# Fiberplane Templates

> Programmatically generate Fiberplane Notebooks for repeatable workflows

## Overview

Fiberplane Templates are built with the [Jsonnet](https://jsonnet.org/) data
templating language.

This crate includes:

- Fiberplane [Jsonnet library](./fiberplane.libsonnet) with functions for
  creating notebooks
  ([API Docs](https://docs.fiberplane.com/reference/templates-api))
- Rust library for expanding templates into notebooks and for converting
  existing notebooks into templates

## Quickstart

The [Fiberplane CLI](https://github.com/fiberplane/fp) is the recommended way to
interact with Templates (see the
[docs](https://docs.fiberplane.com/docs/working-with-templates) or run
`fp help templates`).

## Structure of a Template

Most Fiberplane Templates export a Jsonnet function that accepts some parameters
and creates a notebook using the helper functions provided by the Fiberplane
Jsonnet library.

```jsonnet
local fp = import 'fiberplane.libsonnet';
local c = fp.cell;
local fmt = fp.format;

// Parameters are named and can have default values
function(incidentName='API Outage')
  fp.notebook
    .new('Incident Response for: ' + incidentName)
    .setTimeRangeRelative(minutes=60)
    .addCells([
      // The library exposes helper functions for creating every cell type
      c.h1('Heading'),
      c.text(
        // There are also helper functions for formatting text
        fmt.bold('Hello World!')
      )
    ])
```

See the [templates repository](https://github.com/fiberplane/templates) for more
detailed, use-case-specific templates.

## Snippets

Snippets are smaller pieces of Jsonnet code that produce reusable arrays of
notebook cells, rather than whole notebooks.

```jsonnet
local fp = import 'fiberplane.libsonnet';
local c = fp.cell;
local fmt = fp.format;

fp.snippet([
  c.h2('I am a snippet'),
  c.code('Here is some code'),
])
```

*/

#[cfg(feature = "convert")]
mod convert;
#[cfg(feature = "examples")]
pub mod examples;
#[cfg(feature = "expand")]
mod expand;
#[cfg(feature = "types")]
mod types;

pub static FIBERPLANE_LIBRARY_PATH: &str = "fiberplane.libsonnet";

#[cfg(feature = "convert")]
pub use convert::*;
#[cfg(feature = "expand")]
pub use expand::*;
#[cfg(feature = "types")]
pub use types::*;
