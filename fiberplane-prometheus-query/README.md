# fiberplane-prometheus-query

> TypeScript package for querying Prometheus.

This package provides a subset of the functionality of the Prometheus Provider
that is useful for TypeScript projects where importing the entire Provider
runtime would be overkill.

In addition, it contains helpers for generating PromQL queries for Autometrics.
Given a query type, a function name and optional other information, it will
generate useful queries for generating common charts such as request rate, error
rate and latency. Helpers for processing Prometheus responses to known queries
are included as well.

The query responses are converted to Provider types and are compatible with our
[Provider Protocol](../fiberplane-provider-protocol/). This also ensures they're
readily usable with [fiberplane-charts](../fiberplane-charts/).

Please see https://github.com/fiberplane/providers for the original provider
written in Rust.

## Contributing

If you want to test a work-in-progress in a downstream project, you can use
`yarn build && yarn pack` to create a tarball you can reference like such:

```json
  "dependencies": {
    "@fiberplane/prometheus-query": "/path/to/package.tgz"
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
    "@fiberplane/prometheus-query": "https://git@github.com/fiberplane/fiberplane.git#workspace=fiberplane-prometheus-query&head=<branch_name>"
  }
```

If you want to update `prometheus-query` while using the above syntax, you may
use `yarn up "@fiberplane/prometheus-query@<full-dependency-url>"`.

Make sure to remove the `dist/` folder before opening a PR. CI will fail if you
don't, so you'll be reminded if you forget :)
