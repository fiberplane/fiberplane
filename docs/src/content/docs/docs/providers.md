---
title: Setting up Providers
---

Providers are full-stack plugins in Fiberplane that allow you to pull in live data directly from your infrastructure data sources into your Notebooks. They are compiled to WebAssembly and can run both on the Studio and the `fpd`.

Your data sources can be added from the Studio using direct access (if your data sources URL are open) or using the `data_sources.yaml` file that is then passed in the Docker or Kubernetes configuration. Here’s an example configuration

```yaml
# data_sources.yaml
#
# Replace the following line with the name of the data source
- name: prometheus-prod
  description: Prometheus (Production)
  providerType: prometheus
  config:
      # Replace the following line with your Prometheus URL and port
      url: http://prometheus:9090
      # If accessing your data source requires authentication - add the token below
      token: <TOKEN>
```

## Prometheus

Query, filter, and visualize your Prometheus metrics.

[Prometheus](doc:prometheus)

## Elasticsearch

Query, search, and analyze your Elastic logs.

[Elasticsearch](doc:elasticsearch)

## Grafana Loki

Query, search, and analyze your Loki logs.

[Grafana Loki](doc:grafana-loki)
