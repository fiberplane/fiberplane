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
    "@fiberplane/prometheus-query": "https://git@github.com/fiberplane/fiberplane.git#workspace=fiberplane-prometheus-query&head=<branch_name>"
  }
```

Run `yarn` to install as usual.

If you want to update `prometheus-query` while using the above syntax, you may
use `yarn up "@fiberplane/prometheus-query@<full-dependency-url>"`.

Make sure to remove the `dist/` folder before opening a PR.
