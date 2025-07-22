import type { Context, Env, MiddlewareHandler } from "hono";
import {
  DEFAULT_PLAYGROUND_SERVICES_URL,
  ENV_FIBERPLANE_OTEL_TOKEN,
  ENV_FIBERPLANE_SERVICES_URL,
  ENV_FPX_AUTH_TOKEN,
  ENV_FPX_ENDPOINT,
} from "./constants";
import { ENV_FIBERPLANE_OTEL_ENDPOINT } from "./constants";
import { logIfDebug } from "./debug";
import { createRouter } from "./router";
import type { EmbeddedOptions, ResolvedEmbeddedOptions } from "./types";
import { getFromEnv } from "./utils/env";
// NOTE - We faced issues between Wrangler and Node environments when importing package.json directly in our code.
//        Recent versions of Node wanted us to use `with` syntax,
//        but Wrangler didn't support it yet.
//
// import packageJson from "../package.json" assert { type: "json" };

/**
 * The version of assets to use for the playground ui.
 * This should correspond to the package.json version of the `@fiberplane/hono` package.
 */
export const ASSETS_VERSION = "0.5.5-canary.0";
const CDN_URL = `https://cdn.jsdelivr.net/npm/@fiberplane/hono@${ASSETS_VERSION}/dist/playground/`;

export const createFiberplane =
  <E extends Env>(options: EmbeddedOptions<E>): MiddlewareHandler =>
  async (c, next) => {
    const debug = options.debug ?? false;
    const userApp = options.app;
    const userEnv = c.env;
    const userExecutionCtx = getExecutionCtxSafely(c);

    logIfDebug(debug, "debug logs are enabled");

    const apiKey = options.apiKey ?? getApiKey(c, debug);
    const { mountedPath, internalPath } = getPaths(c);
    const fiberplaneServicesUrl =
      options.fiberplaneServicesUrl ?? getFiberplaneServicesUrl(c);
    const otelEndpoint = getOtelEndpoint(c);
    const otelToken = getOtelToken(c);

    logIfDebug(debug, "mountedPath:", mountedPath);
    logIfDebug(debug, "internalPath:", internalPath);
    logIfDebug(debug, "fiberplaneServicesUrl:", fiberplaneServicesUrl);
    logIfDebug(debug, "otelEndpoint:", otelEndpoint);
    if (otelEndpoint && !otelToken) {
      logIfDebug(
        debug,
        "otelToken is not set, tracing requests will not use bearer auth",
      );
    }
    if (!userExecutionCtx) {
      logIfDebug(debug, "userExecutionCtx is null");
    }

    // Forward request to embedded router, continuing middleware chain if no route matches
    const router = createRouter({
      cdn: options.cdn ?? CDN_URL,
      mountedPath,
      otelEndpoint,
      otelToken,
      userApp,
      userEnv,
      userExecutionCtx,
      ...options,
      // Add the services url here because we already specified a fallback to the DEFAULT_PLAYGROUND_SERVICES_URL
      fiberplaneServicesUrl,
      // Add the api key with a fallback to the env var FIBERPLANE_API_KEY
      apiKey,
    } satisfies ResolvedEmbeddedOptions<E>);

    // Create a new request with the corrected (internal) path
    const newUrl = new URL(c.req.url);
    newUrl.pathname = internalPath;
    const newRequest = new Request(newUrl, c.req.raw);

    logIfDebug(
      debug,
      "Making internal api request:",
      newRequest.method,
      newUrl.toString(),
    );

    const response = await router.fetch(newRequest);

    logIfDebug(
      debug,
      "Finished internal api request:",
      newRequest.method,
      newUrl.toString(),
      "- returned",
      response.status,
    );

    // Skip the middleware and continue if the embedded router doesn't match
    // But make sure we're not ignoring a (json) bases 404.
    if (
      response.status === 404 &&
      response.headers.get("content-type") !== "application/json"
    ) {
      return next();
    }

    return response;
  };

// This middleware is designed to be mounted within another Hono app at any path.
// Since the parent app determines the mount path, we need to extract and remove
// this prefix from incoming requests to ensure proper route matching
function getPaths(c: Context): { mountedPath: string; internalPath: string } {
  const mountedPath = c.req.routePath.replace("/*", "");
  const internalPath = c.req.path.replace(mountedPath, "");

  return {
    mountedPath,
    internalPath,
  };
}

/**
 * Gets the OpenTelemetry endpoint from environment variables.
 * Checks both FIBERPLANE_OTEL_ENDPOINT and the legacy FPX_ENDPOINT.
 * Used to determine where to send telemetry data.
 *
 * @NOTE - The telemetry endpoint is assumed to end in `/v1/traces`
 */
function getOtelEndpoint(c: Context): string | undefined {
  const otelEndpoint = getFromEnv(c?.env, [
    ENV_FIBERPLANE_OTEL_ENDPOINT,
    ENV_FPX_ENDPOINT,
  ]);

  return otelEndpoint ?? undefined;
}

/**
 * Gets the Fiberplane OTel token from environment variables.
 * Checks both FIBERPLANE_OTEL_TOKEN and the legacy FPX_AUTH_TOKEN.
 * Used to authenticate requests to a Fiberplane Otel-worker HTTP API.
 */
function getOtelToken(c: Context): string | undefined {
  const otelToken = getFromEnv(c?.env, [
    ENV_FIBERPLANE_OTEL_TOKEN,
    ENV_FPX_AUTH_TOKEN,
  ]);

  return otelToken ?? undefined;
}

function getFiberplaneServicesUrl(c: Context): string {
  const fiberplaneServicesUrl = getFromEnv(c?.env, [
    ENV_FIBERPLANE_SERVICES_URL,
  ]);

  return fiberplaneServicesUrl ?? DEFAULT_PLAYGROUND_SERVICES_URL;
}

function getApiKey(c: Context, debug?: boolean): string | undefined {
  const FIBERPLANE_API_KEY = c?.env?.FIBERPLANE_API_KEY;
  if (debug) {
    if (FIBERPLANE_API_KEY) {
      logIfDebug(debug, "FIBERPLANE_API_KEY present in env");
    } else {
      logIfDebug(debug, "FIBERPLANE_API_KEY not present in env");
    }
  }
  return FIBERPLANE_API_KEY;
}

/**
 * Gets the execution context from the context object.
 * Returns null if the execution context is not present.
 *
 * We wrap this in a try-catch because Hono will throw an error if
 * there is no `executionCtx` (e.g., in non-Cloudflare environments).
 */
function getExecutionCtxSafely(c: Context) {
  try {
    return c.executionCtx;
  } catch (_e) {
    return null;
  }
}
