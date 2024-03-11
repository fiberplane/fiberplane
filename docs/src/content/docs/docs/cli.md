---
title: Getting started with Fiberplane CLI
---

Fiberplane CLI is a command-line tool that helps you install Proxies, set up
Providers data sources, create and manage Notebooks and Templates all from your
terminal.

## Installing the CLI

Download and install the Fiberplane CLI.

Homebrew:

```bash
brew install fiberplane/tap/fp
```

Install script:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://fp.dev/install.sh | sh
```

Or download the Fiberplane CLI manually (make sure to make it executable):

- [Linux X86](https://fp.dev/fp/latest/x86_64-unknown-linux-gnu/fp)
- [MacOS Arm64](https://fp.dev/fp/latest/aarch64-apple-darwin/fp)
- [MacOS X86](https://fp.dev/fp/latest/x86_64-apple-darwin/fp)

Authenticate your CLI with Fiberplane

```bash
fp login
```

Verify that Fiberplane CLI is working correctly by typing fp without any
arguments. You should see a list of available commands.

![CLI](@assets/images/cli.png)

## Updating the CLI

To update simply type:

```bash
fp update
```

---

## Guides

[Manage fpd and Providers with the CLI](doc:quickstart)

[Create Templates with the CLI](doc:templates)

[Create Webhook triggers with the CLI](doc:triggers)

[`fp run and` Shell to Cell](doc:fp-run-and-shell-to-cell)
