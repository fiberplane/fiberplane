import { type Env, Hono } from "hono";
import type { FiberplaneAppType, SanitizedEmbeddedOptions } from "../types.js";

export default function createPlayground<E extends Env>(
  sanitizedOptions: SanitizedEmbeddedOptions<E>,
) {
  const app = new Hono<E & FiberplaneAppType<E>>();

  const {
    cdn,
    mountedPath,
    openapi,
    otelEndpoint,
    authTraces,
    hasFiberplaneServicesIntegration,
  } = sanitizedOptions;

  // Need to communciate to the frontend whether or not tracing is enabled
  // This is used to determine if we should show the copy-trace-id button
  const hasOtelCollector = !!otelEndpoint;

  const cssBundleUrl = new URL("index.css", cdn).href;
  const jsBundleUrl = new URL("index.js", cdn).href;

  app.get("/*", (c) => {
    return c.html(
      <html lang="en">
        <head>
          <title>API Playground</title>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="stylesheet" href={cssBundleUrl} />
        </head>
        <body>
          <div
            id="root"
            data-options={JSON.stringify({
              mountedPath,
              openapi,
              authTraces,
              hasOtelCollector,
              hasFiberplaneServicesIntegration,
            })}
          />
          <script type="module" src={jsBundleUrl} />
        </body>
      </html>,
    );
  });
  return app;
}
