## Overview

This is an implementation of the Hono-OpenAPI integration from the Hono docs.

You can use it with Fiberplane Playground by visiting `/fp` after starting the api.

## Commands

```sh
# Note - The `touch` script initializes a D1 database *locally* so that we can use it
pnpm db:touch
pnpm db:generate
pnpm db:migrate
```

```sh
pnpm i
pnpm dev
```

To test with Fiberplane, have this app running, and then when you launch the api, open `http://localhost:8787/fp` in your browser.
