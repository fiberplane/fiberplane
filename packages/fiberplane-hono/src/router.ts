import { type Env, Hono } from "hono";
import { logIfDebug } from "./debug.js";
import createApiRoutes from "./routes/api/index.js";
import createTracesApiRoute from "./routes/api/traces.js";
import createEmbeddedPlayground from "./routes/playground.js";
import type { FiberplaneAppType, ResolvedEmbeddedOptions } from "./types.js";

// We use a factory pattern to create routes, which allows for clean dependency injection
// of the apiKey. This keeps the implementation isolated and prevents us from having to
// extend the consuming Hono app's context with our own variables and types.
export function createRouter<E extends Env>(
  options: ResolvedEmbeddedOptions,
): Hono<E & FiberplaneAppType> {
  // Important: whatever gets passed to createEmbeddedPlayground
  // is passed to the playground, aka is on the HTML
  // We therefore remove the apiKey
  const { apiKey, otelEndpoint, otelToken, debug, ...sanitizedOptions } =
    options;

  const app = new Hono<E & FiberplaneAppType>();
  const isDebugEnabled = debug ?? false;

  app.use(async (c, next) => {
    c.set("debug", isDebugEnabled);
    await next();
  });

  // If the OpenTelemetry endpoint is present, we create the internal traces API router
  if (otelEndpoint) {
    logIfDebug(
      isDebugEnabled,
      "OpenTelemetry Endpoint Present. Creating internal traces API router.",
    );
    app.route("/api/traces", createTracesApiRoute(otelEndpoint, otelToken));
  } else {
    logIfDebug(
      isDebugEnabled,
      "OpenTelemetry Endpoint *NOT* Present. Internal traces API router disabled.",
    );
    app.use("/api/traces/*", async (c) => {
      return c.json({ error: "OpenTelemetry endpoint is not set" }, 401);
    });
  }

  // If the API key is present, we create the internal API router
  // Otherwise, we return a 402 error for all internal API requests
  if (apiKey) {
    logIfDebug(
      isDebugEnabled,
      "Fiberplane API Key Present. Creating internal API router.",
    );
    app.route("/api", createApiRoutes(apiKey));
  } else {
    logIfDebug(
      isDebugEnabled,
      "Fiberplane API Key *NOT* Present. Internal API router disabled.",
    );
    app.use("/api/*", async (c) => {
      return c.json({ error: "Fiberplane API key is not set" }, 402);
    });
  }

  const embeddedPlayground = createEmbeddedPlayground(sanitizedOptions);
  app.route("/", embeddedPlayground);

  return app;
}
