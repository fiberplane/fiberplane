# Fiberplane

Welcome to the Fiberplane monorepo!

## Developing

This project uses TypeScript, Biome and pnpm workspaces. Linting and formatting is handled with [Biome](https://biomejs.dev/).

In the project root you can format all TypeScript codebases with `pnpm run format`.

Always publish with `pnpm publish`.

If you've updated the code in `packages/fpx-types`, you'll need to publish a new version of the package before publishing any other packages that depend on it.

## Projects

### Fiberplane Hono (`@fiberplane/hono`)

The `@fiberplane/hono` package is a library for embedding a Fiberplane API Explorer into your Hono app.

The package that is published to npm is in `packages/hono`.

The frontend that is bundled with the package is in `packages/hono-ui`.

### Fiberplane Agents (`@fiberplane/agents`)

The `@fiberplane/agents` package is a toolkit for introspecting and debugging agents built with Cloudflare's Agents SDK. It provides:

- State introspection: Monitor internal state of your agents
- Message tracking: View incoming and outgoing messages between agents
- Instance monitoring: Track each instance of your agents
- Database inspection: View the state of underlying SQLite database used by the agent

The package is located in `packages/agents`.

The frontend components for the agents playground are in `packages/agents-ui`.

### Shared Types

- `packages/fpx-types` - The shared TypeScript types (and constants) used across the projects in the monorepo

### Examples

- `examples/hono-openapi` - Example implementation of the Hono OpenAPI integration
- `examples/simple-agent` - Example implementation of a simple agent

## License

All code within the `fiberplane` repository is distributed under the terms of
both the MIT license and the Apache License (Version 2.0).

See [LICENSE-APACHE](LICENSE-APACHE) and [LICENSE-MIT](LICENSE-MIT).
