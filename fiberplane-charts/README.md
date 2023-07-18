# fiberplane-charts

> Fiberplane Charts library

Exposes `MetricsChart` and `SparkChart` React components used for rendering
charts with `Timeseries` data. The `Timeseries` type is generated from our
[Provider Protocol](../fiberplane-provider-protocol/).

Also exposes the `CoreChart` component, which can render "abstract charts".
Abstract charts are data structures that define how a chart should be
rendered. We use the *Mondrian* library to create abstract charts from
`Timeseries`.

## Contributing

When making changes to the repository, please make sure to run a new build &
commit the generated files before submitting a pull request.

### Building

From the root of `fiberplane-charts`:

```bash
yarn build
```
