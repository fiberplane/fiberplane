# @fiberplane/agents

A toolkit for introspecting and debugging agents built with Cloudflare's Agents SDK.

![agents-playground-preview](https://github.com/user-attachments/assets/4e33d966-aee7-4a70-8087-6a369fd753c7)

## Overview

`@fiberplane/agents` provides debugging and introspection capabilities for agents built with Cloudflare's Agents SDK. It allows you to monitor agent state, track messages, and view instance information in real-time.

## Installation

```bash
npm install @fiberplane/agents
# or
yarn add @fiberplane/agents
# or
pnpm add @fiberplane/agents
```

## Usage

### 1. Wrap your worker's fetch entrypoint

Use the `fiberplane` wrapper for your worker's fetch entrypoint:

```typescript
import { fiberplane } from "@fiberplane/agents";

export default {
  fetch: fiberplane(
    async (request: Request, env: Env, ctx: ExecutionContext) => {
      // Your existing worker logic...
      return await routeAgentRequest(request, env) || 
        new Response("Not found", { status: 404 });
    }
  ),
};
```

### 2. Decorate your agent classes

Add the `@Observed()` decorator to any agent class you want to introspect:

```typescript
import { Observed } from "@fiberplane/agents";
import { Agent } from "agents";

@Observed()
class MyAgent extends Agent<MyEnv, MyState> {
  // Your agent implementation...
}
```

### 3. Access the Agents playground in your browser by appending `/fp` to your worker's URL

## Features

- **State Introspection**: Monitor the internal state of your agents
- **Message Tracking**: View incoming and outgoing messages between agents
- **Instance Monitoring**: Track each instance of your agents
- **Database Inspection**: View the state of underlying SQLite database used by the agent

## Current Status

This package is in early development and is considered a work in progress. APIs may change in future releases. Also, please do not use this package in production yet.

## Publishing a New Version

This package uses the `changeset` workflow for versioning:

1. Run `pnpm build:agents` from the root of the monorepo
2. Run `pnpm changeset` from the root of the monorepo
3. Select major/minor/patch version increment
4. Add a summary of changes
5. Run `pnpm changeset version` when happy with the change description
6. Commit changelog changes
7. Run `pnpm -F @fiberplane/agents publish`

## License

MIT/Apache-2.0
