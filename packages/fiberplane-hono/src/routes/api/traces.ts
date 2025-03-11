import { type Env, Hono } from "hono";
import { logIfDebug } from "../../debug";
import type { FetchFn, FiberplaneAppType } from "../../types";
import { getCookie } from "hono/cookie";

// Using Record<string, unknown> as a simpler type for JSON data
type ApiResponse = Record<string, unknown> | Array<Record<string, unknown>>;

export default function createTracesApiRoute<E extends Env>(
  authTraces: boolean,
  fetchFn: FetchFn,
  otelEndpoint?: string,
  otelToken?: string,
  fiberplaneServicesUrl?: string,
  fiberplaneApiKey?: string,
) {
  const app = new Hono<E & FiberplaneAppType<E>>();

  // Middleware to optionally authenticate and authorize a user for traces api routes
  app.use("*", async (c, next) => {
    if (!authTraces) {
      return next();
    }

    const sessionKey = getCookie(c, "fpSession");

    const authResponse = await fetchFn(
      `${fiberplaneServicesUrl}/api/auth/profile`,
      {
        headers: {
          Authorization: `Bearer ${fiberplaneApiKey}`,
          "Content-Type": "application/json",
          Cookie: `session=${sessionKey}`,
        },
      },
    );

    if (!authResponse.ok) {
      return c.json({ message: "Unauthorized" }, 401);
    }

    const user = await authResponse.json();
    const role = user?.role ?? user?.data?.role;

    if (role !== "admin" && role !== "owner") {
      return c.json({ message: "Unauthorized" }, 403);
    }

    await next();
  });

  app.get("/", async (c) => {
    logIfDebug(
      c,
      "[traces]",
      "- GET / -",
      "Proxying request to fiberplane api",
    );

    if (!otelEndpoint) {
      logIfDebug(
        c,
        "[traces]",
        "- GET / -",
        "otel endpoint undefined, returning early",
      );
      return c.json({ error: "Tracing is not enabled" }, 402);
    }

    if (!otelToken) {
      logIfDebug(
        c,
        "[traces]",
        "- GET / -",
        "otel token undefined, skipping auth header",
      );
    } else {
      logIfDebug(
        c,
        "[traces]",
        "- GET / -",
        "otel token defined, adding auth header",
      );
    }

    try {
      const otelBaseUrl = getOtelBaseUrl(otelEndpoint);
      const requestUrl = `${otelBaseUrl}/v1/traces`;
      const response = await fetchFn(requestUrl, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(otelToken ? { Authorization: `Bearer ${otelToken}` } : {}),
        },
      });
      logIfDebug(
        c,
        "[traces]",
        "- GET / -",
        "API response from traces endpoint:",
        response,
      );
      const data = (await response.json()) as ApiResponse;
      return c.json(data);
    } catch (error) {
      console.error("Failed to fetch traces:", error);
      return c.json({ error: "Failed to fetch traces" }, 500);
    }
  });

  app.get("/:traceId/spans", async (c) => {
    logIfDebug(
      c,
      "[traces]",
      "- GET /:traceId/spans -",
      "Proxying request to fiberplane api",
    );

    if (!otelEndpoint) {
      return c.json({ error: "Tracing is not enabled" }, 402);
    }

    if (!otelToken) {
      logIfDebug(
        c,
        "[traces]",
        "- GET /:traceId/spans -",
        "otel token undefined, skipping auth header",
      );
    }

    try {
      const otelBaseUrl = getOtelBaseUrl(otelEndpoint);
      const traceId = c.req.param("traceId");
      const requestUrl = `${otelBaseUrl}/v1/traces/${traceId}/spans`;
      const response = await fetch(requestUrl, {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(otelToken ? { Authorization: `Bearer ${otelToken}` } : {}),
        },
      });
      logIfDebug(
        c,
        "[traces]",
        "- GET /:traceId/spans -",
        "API response from spans endpoint:",
        response,
      );
      const data = (await response.json()) as ApiResponse;
      return c.json(data);
    } catch (error) {
      console.error("Failed to fetch spans:", error);
      return c.json({ error: "Failed to fetch spans" }, 500);
    }
  });

  return app;
}

function getOtelBaseUrl(otelEndpoint: string) {
  const url = new URL(otelEndpoint);
  return url.origin;
}
