---
title: Prometheus
---

Write and run PromQL queries, and display Prometheus charts and tables alongside the rest of your content.

![Prometheus](@assets/images/prometheus.png)

## Setup

In order to enable Prometheus Provider in Fiberplane you need to either add it via direct access (for an openly accessible URL) or add it as a valid entry in the `data_source.yaml` configuration.

The `data_sources.yaml` format for adding a Prometheus Provider looks like this:

```yaml
# data_sources.yaml

- name: prometheus-prod
  description: Prometheus (Production)
  providerType: prometheus
  config:
    # Replace the following line with your Prometheus URL
    url: http://prometheus
    # If accessing your Prometheus requires authentication - add the token below
    token: <TOKEN>
```

## Usage

### Create a Prometheus chart

1. Hit `/` and select “Prometheus chart” from the available options.
2. Write a PromQL you want to run:

```promql
(1 - avg(irate(node_cpu_seconds_total{mode="idle"}[1m])) by (instance)) * 100
```

3. Hit CTRL + ENTER or ⌘↩︎ if you’re on a Mac to run the query

### Graph controls

![Prometheus query](@assets/images/prometheus-query.png)

Fiberplane Notebook offers several options to help visualize your metrics data. You can choose between bar and line charts as well as select different stacking options.

### Chart time range

By default, the query will follow the Notebook time range (configured at the top of the Notebook) so all of your charts in a notebook use the same time range. As you change the Notebook time range it will update all of your charts automatically.

You can also set a chart-specific time range overrides by clicking the link icon at the top of the chart.

### Toggle live

By default the generated metrics chart will follow the Notebook time range, however, you can also toggle it to update live (the graph will update every 30 seconds).
