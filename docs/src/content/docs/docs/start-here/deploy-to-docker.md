---
title: Deploy to Docker
---

## Deploy to Docker

### Generate a `fpd` API Token in the Studio

![Register a daemon](@assets/images/register_an_fpd.png)

In order for the `fpd` to talk to the Fiberplane Studio successfully it needs to be successfully authorized. This step will generate a **`fpd` API Token** that will be needed later.

1. Go to your Fiberplane Settings page.
2. Click **`+ New`** to register a proxy with a name that identifies the cluster you will install it into (for example, "Production"). This will generate and display a `fpd` API Token that the proxy will use to authenticate with the Fiberplane Studio.
3. Copy the `fpd` API Token generated in Step 2 for the next step.

### Deploy using Docker

1. Make sure you have Docker installed: [https://docs.docker.com/get-docker/](https://docs.docker.com/get-docker/)
2. Create a `data_sources.yaml` in the current directory in the following format:

```yaml
# data_sources.yaml
#
# Replace the following line with the name of the data source
- name: prometheus-prod
  description: Prometheus (Production)
  providerType: prometheus
  config:
    # Replace the following line with your Prometheus URL
    url: http://prometheus
```

<!--markdownlint-disable-next-line-->
3. Run the following command replacing `<FPD_API_TOKEN>` with the `fpd` API Token created earlier:

```bash
docker run \
  -v "$PWD/data_sources.yaml:/app/data_sources.yaml" \
  fiberplane/fpd:v2 \
  --token=<FPD_API_TOKEN>
```

Once you complete your `fpd` setup, your data sources linked in the `fpd` configuration should be recognized by the Studio - you can verify this again by going to the **Settings > Data Sources** screen.👇

![Untitled](@assets/images/Untitled.png)
