# Fiberplane Hono OpenTelemetry Library

This is a client library that will send telemetry data to a *local* Fiberplane Studio server upon every incoming request and outgoing response, in order to be visualized in the Studio UI.

Under the hood, it uses [OpenTelemetry](https://opentelemetry.io/) traces to collect telemetry data and send it to a local FPX server.

By default, it proxies `console.*` functions to send logging data to a local Fiberplane Studio server, 
so any time you use a `console.log`, `console.error`, etc., in your app, it will also send those log messages to FPX.

Likewise, any time your app makes a `fetch` request, it will create a trace for that request. This behavior is configurable.

The library is a no-op when the `FIBERPLANE_OTEL_ENDPOINT` environment variable is not present.

## Quick Start

Create Hono project
```sh
# Create a hono project, using cloudflare-workers runtime
npm create hono@latest my-hono-project
# > cloudflare-workers
```

Install the Fiberplane Hono Opentelemetry Library

```sh
npm i @fiberplane/hono-otel
```

Wrap your Hono app with the `instrument` function:

```ts
import { Hono } from "hono";
import { instrument } from "@fiberplane/hono-otel";

const app = new Hono();

app.get("/", (c) => c.text("Hello, Hono!"));

export default instrument(app);
```

Set the `FIBERPLANE_OTEL_ENDPOINT` environment variable to the URL of an OpenTelemetry collector.

> To test with an OpenTelemetry collector, you can use the [Fiberplane otel-worker](https://github.com/fiberplane/otel-worker) which can also be deployed locally.
>
> In this case, you would set the `FIBERPLANE_OTEL_ENDPOINT` to `http://localhost:24318/v1/traces` and the `FIBERPLANE_OTEL_TOKEN` to the token of the otel-worker.

## Usage

This section takes you through:

- Installing the Fiberplane Hono OpenTelemetry Library
- Configuring the library
- Advanced usage with custom spans

It assumes you already have a Hono app running locally.

### Installation

Install the library in your project. If you're feeling adventurous, you can install the `canary` version:

```bash
npm install @fiberplane/hono-otel@latest
# or
npm install @fiberplane/hono-otel@canary
```

Wrap your Hono app with the `instrument` function:

```typescript
import { Hono } from "hono";
import { instrument } from "@fiberplane/hono-otel";

const app = new Hono();

app.get("/", (c) => c.text("Hello, Hono!"));

// Other routes and middleware can be added here

export default instrument(app);
```

### Configuration

If you're running in Cloudflare Workers, enable nodejs compatibility mode.

```toml
# Add this to the top level of your wrangler.toml
compatibility_flags = [ "nodejs_compat" ]
```

#### The `FIBERPLANE_OTEL_ENDPOINT` Environment Variable

When your app is running, the `FIBERPLANE_OTEL_ENDPOINT` environment variable controls where the client library sends telemetry data.

If `FIBERPLANE_OTEL_ENDPOINT` is not defined, the middleware will do nothing. 

If the endpoint is a local address, the client library will collect as much data as possible for each request. Otherwise, sensitive information will be removed from the telemetry data.

You can control this behavior by setting the `FIBERPLANE_ENVIRONMENT` env variable to `"local"` to force the library to send as much data as possible, or `"production"` to force the library to send only essential data.

As mentioned earlier, there is an open source [otel-worker](https://github.com/fiberplane/otel-worker) that you can run either locally on on Cloudflare to collect telemetry data from your app.

When using the otel-worker locally, your `.dev.vars` file would look like this:

```sh
FIBERPLANE_OTEL_ENDPOINT=http://localhost:24318/v1/traces
FIBERPLANE_OTEL_TOKEN="your-secret-token-here"
```

#### Additional Configuration

When you instrument your app, you can also pass in a configuration object to override the default behavior of the `instrument` function.

The options are:

- `monitor.fetch`: Whether to create traces for all fetch requests. (Default: `true`)
- `monitor.logging`: Whether to proxy `console.*` functions to send logging data to a local Fiberplane Studio server. (Default: `true`)
- `monitor.cfBindings`: Whether to proxy Cloudflare bindings (D1, R2, KV, AI) to add instrumentation to them. (Default: `true`)
- `redactedHeaders`: Headers whose values should always be redacted.
- `redactedQueryParams`: Query params whose values should always be redacted.
- `libraryDebugMode`: Whether to enable debug logging in the library. (Default: `false`)

Here is an example:

```typescript
import { Hono } from "hono";
import { instrument } from "@fiberplane/hono-otel";

const app = new Hono();

app.get("/", (c) => c.text("Hello, Hono!"));

export default instrument(app, {
  // Enable debug logging in the library
  libraryDebugMode: true,
  monitor: {
    // Do not create traces for fetch requests
    fetch: false,
    // Do not proxy `console.*` functions to send logging data to a local FPX server
    logging: false,
    // Do not proxy Cloudflare bindings (D1, R2, KV, AI, Service Bindings) to add instrumentation to them
    cfBindings: false,
  },
});
```

#### Redacting Headers and Query Params

You can redact headers and query params by setting the `redactedHeaders` and `redactedQueryParams` options.

```typescript
import { Hono } from "hono";
import { instrument } from "@fiberplane/hono-otel";

const app = new Hono();

app.get("/", (c) => c.text("Hello, Hono!"));

export default instrument(app, {
  redactedHeaders: ["x-mycompany-api-key"],
  redactedQueryParams: ["my_api_key"],
});
```

These values will **not** be recorded inside spans, and their values will show up as `"REDACTED"`.

We merge any `redactedHeaders` and `redactedQueryParams` values with a list of sensible defaults, which are exported by the library as `DEFAULT_REDACTED_HEADERS` and `DEFAULT_REDACTED_QUERY_PARAMS`.

#### The `FIBERPLANE_OTEL_LOG_LEVEL` Environment Variable

The `FIBERPLANE_OTEL_LOG_LEVEL` environment variable controls the verbosity of the library's logging.

The possible values are: `debug`, `info`, `warn`, and `error`.

The default value is `warn`.

The `libraryDebugMode` option (documented in the previous section), takes precedence over this environment variable.

### Advanced Usage: Custom Spans with `measure`

The library also allows you to create custom spans for any function in your app.

To make use of this feature, you need to import the `measure` function from the library and wrap your function with it.

```typescript
import { instrument, measure } from "@fiberplane/hono-otel";

const app = new Hono();

// Create a loop function that will get recorded as a span inside the trace for a incoming given request
const loop = measure("loop", (n: number) => {
  for (let i = 0; i < n; i++) {
    console.log(`Loop iteration: ${i}`);
  }
});

app.get("/", (c) => {
  loop(100);
  return c.text("Hello, Hono!");
});

export default instrument(app);
```

## Development

See [DEVELOPMENT.md](./DEVELOPMENT.md) for instructions on how to develop this library.
