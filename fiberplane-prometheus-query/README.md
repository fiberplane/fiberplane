# fiberplane-prometheus-query

> TypeScript package for querying Prometheus.

This package provides a subset of the functionality of the Prometheus Provider
that is useful for TypeScript projects where importing the entire Provider
runtime would be overkill.

The query responses are converted to Provider types and are compatible with our
[Provider Protocol](../fiberplane-provider-protocol/). This also ensures they're
readily usable with [fiberplane-charts](../fiberplane-charts/).

Please see https://github.com/fiberplane/providers for the original provider
written in Rust.
