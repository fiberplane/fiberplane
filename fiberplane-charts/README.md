# fiberplane-charts

> Fiberplane Charts library

Exposes `MetricsChart` and `SparkChart` React components used for rendering
charts with `Timeseries` data. The `Timeseries` type is generated from our
[Provider Protocol](../fiberplane-provider-protocol/).

Also exposes the `CoreChart` component, which can render "abstract charts".
Abstract charts are data structures that define how a chart should be
rendered. We use the *ACG* library to convert from `Timeseries` to abstract
charts.
