---
title: Quickstart
sidebar:
    order: 0
---

Fiberplane Studio is available for the [Web](https://fiberplane.com/).

To get started go to [https://fiberplane.com/](https://fiberplane.com/) and log
in with your Fiberplane account (currently available only for Google Workspace
or Gmail users). You can also get right to your notebook by typing
[fp.new](https://fp.new/)

![How it works](@assets/images/fpd.png)

## How Fiberplane works

Fiberplane Studio allows you to query, visualize, and understand metrics and
logs in your infrastructure.

Whenever you execute a query in the notebook:

1. The query is forwarded to the Fiberplane `fpd` in your cluster;
2. The `fpd` then queries the Provider data source (e.g. your Prometheus or
	 Elastic instance);
3. When the Provider returns the data, the `fpd` processes, encrypts, and then
	 returns it back to the Studio.

## Set up the Fiberplane Daemon

The Fiberplane Daemon is a package that runs in your infrastructure. It enables
you to connect the Fiberplane Studio to data sources in your cluster(s) securely
without exposing them to the Internet.

The Fiberplane Daemon is available as a [container on Docker
Hub](https://hub.docker.com/r/fiberplane/fpd).

---

In order for the Daemon to receive queries from Fiberplane Notebooks, it needs
to be authorized. This step will generate a **Daemon API Token** that will be
needed in later steps.

You can do it in the Settings > FPD menu or using our CLI tool.

### Generate an FPD API Token in the Studio

![Register a proxy](@assets/images/register_an_fpd.png)

In order for the Daemon to talk to the Fiberplane Studio successfully it needs
to be successfully authorized. This step will generate a **Daemon API Token**
that will be needed later.

1. Go to your Fiberplane Settings page.
2. Click **`+ New`** to register a proxy with a name that identifies the cluster
	 you will install it into (for example, "Production"). This will generate and
	 display a Daemon API Token that the proxy will use to authenticate with the
	 Fiberplane Studio.
3. Copy the Daemon API Token generated in Step 2 for the next step.

## Generate a Daemon API Token using the CLI

Download and install the Fiberplane CLI

```shell
curl --proto '=https' --tlsv1.2 -sSf https://fp.dev/install.sh | sh
```

Or download the Fiberplane CLI manually (make sure to make it executable
`chmod +x ./fp`):

- [Linux X86](https://fp.dev/fp/latest/x86_64-unknown-linux-gnu/fp)
- [MacOS Arm64](https://fp.dev/fp/latest/aarch64-apple-darwin/fp)
- [MacOS X86](https://fp.dev/fp/latest/x86_64-apple-darwin/fp)

Authenticate your CLI with Fiberplane

```shell
fp login
```

To register a daemon run a command `fp daemon create`:

```shell
$ fp daemon create my-daemon-name
		Name:  my-daemon-name
          ID:  <generated_daemon_id>
      Status:  disconnected
 Datasources:  (none)
        Token  <YOUR_DAEMON_API_TOKEN> <-- SAVE THIS FOR LATER!
```

You can leave out the daemon name to have one randomly generated, but we
recommend naming it according to the environment it will be deployed to (for
example, `production`). Note that daemon names must follow the [Fiberplane name
format](doc:configuration-help-faq#resource-names).

## Next steps

You can now:

- add Providers;
- deploy the `fpd` to Kubernetes cluster, Docker container or run it locally for
	testing.

## Add Providers

[Setting up Providers](doc:setting-up-providers)

## Deploy

[Deploy to Kubernetes](doc:deploy-to-kubernetes)

[Deploy to Docker](doc:deploy-to-docker)

[Run Locally](doc:run-locally)

---

[Configuration help / FAQ](doc:configuration-help-faq)
