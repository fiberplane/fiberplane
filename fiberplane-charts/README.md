# fiberplane-charts

> Fiberplane Charts library

Exposes `MetricsChart` and `SparkChart` React components used for rendering
charts with `Timeseries` data. The `Timeseries` type is generated from our
[Provider Protocol](https://github.com/fiberplane/fiberplane/tree/main/fiberplane-provider-protocol).

Also exposes the `CoreChart` component, which can be used to interactively
render [Mondrian charts](https://crates.io/crates/mondrian-charts/).
`fiberplane-charts` contains a full TypeScript implementation of the Mondrian
types, as well as the generators from Fiberplane `Timeseries`.

## Contributing

If you want to test a work-in-progress in a downstream project while working in
a custom branch, you can manually generate the `dist/` folder and check it in
like so:

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

Run `yarn` to install as usual.

If you want to update `fiberplane-charts` while using the above syntax, you may
use `yarn up "@fiberplane/fiberplane-charts@<full-dependency-url>"`.

Make sure to remove the `dist/` folder before opening a PR.
