# fiberplane-charts

> Fiberplane Charts library

Exposes `MetricsChart` and `SparkChart` React components used for rendering
charts with `Timeseries` data. The `Timeseries` type is generated from our
[Provider Protocol](../fiberplane-provider-protocol/).

Also exposes the `CoreChart` component, which can render "abstract charts".
Abstract charts are data structures that define how a chart should be
rendered. We use the _Mondrian_ library to create abstract charts from
`Timeseries`.

## Extending styles

If you want to extend the styles of the charts, you can pass a `chartTheme` prop
to the `MetricsChart` component. This prop should be an object with values
defined in the `ChartTheme` interface.

```tsx
import { MetricsChart, type ChartTheme } from "@fiberplane/charts";

const chartTheme: ChartTheme = {
  axisColor: "#EBEBEB",
  //...
};

const MyComponent = () => {
  return (
    <MetricsChart
      chartTheme={chartTheme}
      //...
    />
  );
};
```

## Contributing

When making changes to the repository, please make sure to run a new build &
commit the generated files before submitting a pull request.

### Building

From the root of `fiberplane-charts`:

```bash
yarn build
```
