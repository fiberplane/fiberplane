---
title: Grafana Loki
---

Write and run LogQL queries, and display Grafana Loki logs output alongside the rest of your content.

## Setup

In order to enable Grafana Loki Provider in Fiberplane you need to either add it via direct access (for an openly accessible URL) or add it as a valid entry in the `data_source.yaml` configuration.  The `data_sources.yaml` format for adding a Loki Provider looks like this:

```yaml
# data_sources.yaml

- name: loki-staging
  description: Loki (Staging)
  providerType: loki
  config:
    # Replace the following line with your Loki URL
    url: http://loki:3100
    # If accessing your Grafana Loki requires authentication - add the token (Bearer or Basic) below
    token: <TOKEN>
```

## Usage

### Create a Grafana Loki table

1. Hit `/` and select “Loki” from the available options
2. Write a LogQL query you want to run to pull in Loki logs.
3. Hit CTRL + ENTER or ⌘↩︎ if you’re on a Mac to run it.

### Chart time range

By default, the query will follow the Notebook time range (configured at the top of the Notebook) so all of your charts in a notebook use the same time range. As you change the Notebook time range it will update all of your charts automatically.

You can also set a chart-specific time range overrides by clicking the link icon at the top of the chart.

![Grafana Loki](@assets/images/elastic-query.png)

### Expand, select, highlight, and export records

Once logs are loaded you can:

- Expand to show them in a more readable view;
- Select interesting records;
- Highlight them for the rest of your team;
- Export them into a separate table so they are archived and do not get affected by time range changes in the notebook.

### Add columns

By default, the logs output shows in a full document body output. However, you can configure this to show only the fields you select. Click `+ Add columns` and select or unselect the fields you want to see/hide. The selected fields will show as columns in a horizontal view.
