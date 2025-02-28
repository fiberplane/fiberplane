import { type Env, Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import { logIfDebug } from "./debug";
import { webStandardFetch } from "./fetch";
import createApiRoutes from "./routes/api";
import createTracesApiRoute from "./routes/api/traces";
import createEmbeddedPlayground from "./routes/playground";
import createRunnerRoute from "./routes/runner";
import type {
  FetchFn,
  FiberplaneAppType,
  ResolvedEmbeddedOptions,
} from "./types";

// We use a factory pattern to create routes, which allows for clean dependency injection
// of the apiKey. This keeps the implementation isolated and prevents us from having to
// extend the consuming Hono app's context with our own variables and types.
export function createRouter<E extends Env>(
  options: ResolvedEmbeddedOptions<E>,
): Hono<E & FiberplaneAppType<E>> {
  // Important: whatever gets passed to createEmbeddedPlayground
  // is passed to the playground, aka is on the HTML
  // We therefore remove the apiKey
  const { apiKey, otelEndpoint, otelToken, debug, ...sanitizedOptions } =
    options;

  const fetchFn: FetchFn = options.fetch ?? webStandardFetch;

  const app = new Hono<E & FiberplaneAppType<E>>();
  const isDebugEnabled = debug ?? false;

  app.use(async (c, next) => {
    c.set("debug", isDebugEnabled);
    await next();
  });

  app.use(contextStorage());

  app.use(async (c, next) => {
    await next();
    logIfDebug(isDebugEnabled, "==== matched routes ====");
    for (const [
      i,
      { handler, method, path },
    ] of c.req.matchedRoutes.entries()) {
      const name =
        handler.name || (handler.length < 2 ? "[handler]" : "[middleware]");
      logIfDebug(
        isDebugEnabled,
        method,
        " ",
        path,
        " ".repeat(Math.max(10 - path.length, 0)),
        name,
        i === c.req.routeIndex ? "<- respond from here" : "",
      );
    }
    logIfDebug(isDebugEnabled, "==== end of matched routes ====");
  });

  // If the OpenTelemetry endpoint is present, we create the internal traces API router
  if (otelEndpoint) {
    logIfDebug(
      isDebugEnabled,
      "OpenTelemetry Endpoint Present. Creating internal traces API router.",
    );
    app.route(
      "/api/traces",
      createTracesApiRoute(fetchFn, otelEndpoint, otelToken),
    );
  } else {
    logIfDebug(
      isDebugEnabled,
      "OpenTelemetry Endpoint *NOT* Present. Internal traces API router disabled.",
    );
    app.use("/api/traces/*", async (c) => {
      return c.json({ error: "OpenTelemetry endpoint is not set" }, 401);
    });
  }

  app.use(async (c, next) => {
    c.set("userApp", options.userApp);
    c.set("userEnv", options.userEnv);
    c.set("userExecutionCtx", options.userExecutionCtx);
    await next();
  });

  // If the API key is present, we create the internal API router
  // Otherwise, we return a 402 error for all internal API requests
  if (apiKey) {
    logIfDebug(
      isDebugEnabled,
      "Fiberplane API Key Present. Creating internal API router.",
    );
    app.route("/w", createRunnerRoute(apiKey));
    app.route("/api", createApiRoutes(fetchFn, apiKey));
  } else {
    logIfDebug(
      isDebugEnabled,
      "Fiberplane API Key *NOT* Present. Internal API router disabled.",
    );
    app.use("/api/*", async (c) => {
      return c.json({ error: "Fiberplane API key is not set" }, 402);
    });
    app.use("/w/*", async (c) => {
      return c.json({ error: "Fiberplane API key is not set" }, 402);
    });
  }

  const embeddedPlayground = createEmbeddedPlayground<E>(sanitizedOptions);
  app.route("/", embeddedPlayground);

  return app;
}
