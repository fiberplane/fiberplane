---
title: Run Locally 
---

> 📍Note
>
> This option is suggested for testing purposes. If you intend to run the Proxy in production, it is strongly recommended to install it in your production cluster (see instructions above).

## Download the Proxy and Providers

Choose your architecture and download the files. Keep them in a single folder (simply unzip the downloaded file).

- [For Mac (Apple Silicon)](https://fp.dev/proxy/latest/aarch64-apple-darwin/proxy.zip)
- [For Mac (Intel)](https://fp.dev/proxy/latest/x86_64-apple-darwin/proxy.zip)
- [For Linux (Arm)](https://fp.dev/proxy/latest/aarch64-unknown-linux-gnu/proxy.zip)
- [For Linux (x86)](https://fp.dev/proxy/latest/x86_64-unknown-linux-gnu/proxy.zip)

## Generate a `fpd` API Token in the Studio

![Register an fpd](@assets/images/register_an_fpd.png)

In order for the `fpd` to talk to the Fiberplane Studio successfully it needs to be successfully authorized. This step will generate a *`fpd` API Token* that will be needed later.

1. Go to your Fiberplane Settings page.
2. Click `+ New` to register an `fpd` with a name that identifies the cluster you will install it into (for example, "Production"). This will generate and display an `fpd` API Token that the proxy will use to authenticate with the Fiberplane Studio.
3. Copy the `fpd` API Token generated in Step 2 for the next step.

## Create a `data_sources.yaml` file

Create a data_sources.yaml configuration file in the same folder as the Proxy binary. Using the format below add the data sources you want to connect Fiberplane with:

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

## Run the `fpd`

Run the `fpd` executable passing in the previously created token as an argument.

```bash
./fpd --token <FPD_API_TOKEN>
```

Once you complete your `fpd` setup, your data sources linked in the `fpd` configuration should be recognized by the Studio - you can verify this again by going to the **Settings > Data Sources** screen.👇

![Untitled](@assets/images/Untitled.png)
