import {
  ENV_FIBERPLANE_OTEL_ENDPOINT,
  ENV_FIBERPLANE_OTEL_LOG_LEVEL,
  ENV_FIBERPLANE_OTEL_TOKEN,
  ENV_FIBERPLANE_SERVICE_NAME,
  ENV_FPX_AUTH_TOKEN,
  ENV_FPX_ENDPOINT,
  ENV_FPX_LOG_LEVEL,
  ENV_FPX_SERVICE_NAME,
} from "../constants";
import { type FpHonoEnv, getFromEnv } from "../utils";
import { isInLocalMode } from "./local-mode";
import type { FpxConfig, FpxConfigOptions } from "./types";

/**
 * Determines the "mode" of the application based on the provided configuration and environment variables.
 * Precendence is given to the user-provided config, then the env vars.
 * The default value is "local" if the otelEndpoint includes "localhost",
 * otherwise it is "production".
 */
export function getMode(
  otelEndpoint: string | null,
  userConfig: FpxConfigOptions | undefined,
  env: FpHonoEnv,
): "local" | "production" {
  if (userConfig?.mode === "local" || userConfig?.mode === "production") {
    return userConfig.mode;
  }

  const isLocalFallback = isLocalEndpoint(otelEndpoint);
  const isLocal = isInLocalMode(env, isLocalFallback);

  return isLocal ? "local" : "production";
}

/**
 * Determines if the provided otel endpoint is a local endpoint
 *
 * @returns `true` if the endpoint is local, `false` otherwise
 */
function isLocalEndpoint(otelEndpoint: string | null): boolean {
  if (!otelEndpoint) {
    return false;
  }

  try {
    const url = new URL(otelEndpoint);
    const host = url.hostname.toLowerCase();
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host.endsWith(".localhost")
    );
  } catch {
    // If URL parsing fails, fall back to simple string check
    const lowercaseEndpoint = otelEndpoint.toLowerCase();
    return (
      lowercaseEndpoint.includes("localhost") ||
      lowercaseEndpoint.includes("127.0.0.1") ||
      lowercaseEndpoint.includes("::1")
    );
  }
}

/**
 * Get the OTLP endpoint from the environment variables.
 */
export function getOtelEndpoint(env: FpHonoEnv) {
  return getFromEnv(env, [
    // FIBERPLANE_OTEL_ENDPOINT takes precedence over FPX_ENDPOINT
    ENV_FIBERPLANE_OTEL_ENDPOINT,
    // FPX_ENDPOINT is the fallback, here for backwards compatibility
    ENV_FPX_ENDPOINT,
  ]);
}
/**
 * Get the bearer token for the OTLP endpoint from the environment variables.
 */
export function getOtelToken(env: FpHonoEnv) {
  return getFromEnv(env, [
    // FIBERPLANE_OTEL_TOKEN takes precedence over FPX_AUTH_TOKEN
    ENV_FIBERPLANE_OTEL_TOKEN,
    // FPX_AUTH_TOKEN is the fallback, here for backwards compatibility
    ENV_FPX_AUTH_TOKEN,
  ]);
}

/**
 * Get the library's log level from the environment variables.
 */
export function getLogLevel(config: FpxConfig, env: FpHonoEnv) {
  if ("libraryDebugMode" in config && config.libraryDebugMode) {
    return "debug";
  }
  return getFromEnv(env, [
    // FIBERPLANE_OTEL_LOG_LEVEL takes precedence over FPX_LOG_LEVEL
    ENV_FIBERPLANE_OTEL_LOG_LEVEL,
    // FPX_LOG_LEVEL is the fallback, here for backwards compatibility
    ENV_FPX_LOG_LEVEL,
  ]);
}

export function getServiceName(env: FpHonoEnv, fallback: string): string {
  const serviceName = getFromEnv(env, [
    ENV_FIBERPLANE_SERVICE_NAME,
    ENV_FPX_SERVICE_NAME,
  ]);
  return serviceName ?? fallback;
}
