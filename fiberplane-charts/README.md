# fiberplane-charts

> Fiberplane Charts library

Exposes `MetricsChart` and `SparkChart` React components used for rendering
charts with `Timeseries` data. The `Timeseries` type is generated from our
[Provider Protocol](https://github.com/fiberplane/fiberplane/tree/main/fiberplane-provider-protocol).

Also exposes the `CoreChart` component, which can be used to interactively
render [Mondrian charts](https://crates.io/crates/mondrian-charts/).
`fiberplane-charts` contains a full TypeScript implementation of the Mondrian
types, as well as the generators from Fiberplane `Timeseries`.

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

If you want to test a work-in-progress in a downstream project, you can use
`yarn build && yarn pack` to create a tarball you can reference like such:

```json
  "dependencies": {
    "@fiberplane/fiberplane-charts": "/path/to/package.tgz"
  }
```

### Sharing a custom branch

If you want to share a WIP branch with others, it might be more convenient to
forcibly check in the `dist/` folder, which you can do like so:

```sh
yarn build
git add -f dist
git commit -m "WIP"
git push -u origin branch_name
```

Then point your dependency in the downstream project to the custom branch using
the following syntax:

```json
  "dependencies": {
    "@fiberplane/fiberplane-charts": "https://git@github.com/fiberplane/fiberplane.git#workspace=fiberplane-charts&head=<branch_name>"
  }
```

If you want to update `fiberplane-charts` while using the above syntax, you may
use `yarn up "@fiberplane/fiberplane-charts@<full-dependency-url>"`.

Make sure to remove the `dist/` folder before opening a PR. CI will fail if you
don't, so you'll be reminded if you forget :)
