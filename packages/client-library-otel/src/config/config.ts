import type { FpHonoEnv } from "../utils";
import {
  getLogLevel,
  getMode,
  getOtelEndpoint,
  getOtelToken,
  getServiceName,
} from "./resolvers";
import type { FpConfig, FpConfigOptions, FpxMode } from "./types";

export type FpResolvedConfig = {
  enabled: boolean;
  mode: FpxMode;
  redactedHeaders: Set<string>;
  redactedQueryParams: Set<string>;
  otelEndpoint: string | null;
  otelToken: string | null;
  logLevel: string | null;
  serviceName: string;
  libraryDebugMode: boolean;
  monitor: {
    fetch: boolean;
    logging: boolean;
    cfBindings: boolean;
  };
};

/**
 * OpenTelemetry advises that instrumentations should require explicit configuration of which headers to capture.
 *
 * We want to minimize configuration, so instead, we've chosen to ignore the following headers by default.
 *
 * In practice, the library only redacts their values when running in "production" mode.
 */
export const DEFAULT_REDACTED_HEADERS = [
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "x-amz-security-token",
  "x-real-ip",
  "x-forwarded-for",
  "proxy-authorization",
  "www-authenticate",
  "proxy-authenticate",
  "x-real-ip",
  "x-auth-token",
  "x-csrf-token",
  "x-session-id",
] as const;

export const DEFAULT_REDACTED_QUERY_PARAMS = [
  "code",
  "token",
  "access_token",
  "refresh_token",
  "id_token",
  "state",
  "secret",
  "password",
  "api_key",
];

export const DEFAULT_CONFIG: FpConfig = Object.freeze({
  redactedHeaders: [...DEFAULT_REDACTED_HEADERS],
  redactedQueryParams: [...DEFAULT_REDACTED_QUERY_PARAMS],
  libraryDebugMode: false,
  monitor: {
    fetch: true,
    logging: true,
    cfBindings: true,
  },
});

export function resolveConfig(
  userConfig: FpConfigOptions | undefined,
  env: FpHonoEnv,
): FpResolvedConfig {
  const config = mergeConfigs(DEFAULT_CONFIG, userConfig);

  const otelEndpoint = getOtelEndpoint(env);

  // NOTE - Instrumentation is enabled if the FIBERPLANE_OTEL_ENDPOINT is set.
  //        This means we do *not* want to have a default for the FIBERPLANE_OTEL_ENDPOINT (prev: FPX_ENDPOINT),
  //        Otherwise, users might accidentally deploy to production with our middleware and
  //        start sending data to the default url.
  const enabled = !!otelEndpoint && typeof otelEndpoint === "string";

  // NOTE - "local" mode will send the kitchen sink with every trace: env vars, request bodies, etc.
  const mode = getMode(otelEndpoint, userConfig, env);

  const otelToken = getOtelToken(env);
  const logLevel = getLogLevel(config, env);
  const serviceName = getServiceName(env, "unknown");

  const redactedHeaders = new Set(config.redactedHeaders);
  const redactedQueryParams = new Set(config.redactedQueryParams);

  return {
    ...config,
    redactedHeaders,
    redactedQueryParams,
    enabled,
    mode,
    otelEndpoint,
    otelToken,
    logLevel,
    serviceName,
  };
}

/**
 * Last-in-wins deep merge for {@link FpConfig}
 */
function mergeConfigs(
  fallbackConfig: FpConfig,
  userConfig?: FpConfigOptions,
): FpConfig {
  const libraryDebugMode =
    typeof userConfig?.libraryDebugMode === "boolean"
      ? userConfig.libraryDebugMode
      : fallbackConfig.libraryDebugMode;

  return {
    libraryDebugMode,
    redactedHeaders: mergeRedactedHeaders(
      fallbackConfig.redactedHeaders,
      userConfig?.redactedHeaders,
    ),
    redactedQueryParams: mergeRedactedQueryParams(
      fallbackConfig.redactedQueryParams,
      userConfig?.redactedQueryParams,
    ),
    monitor: Object.assign({}, fallbackConfig.monitor, userConfig?.monitor),
  };
}

function mergeRedactedHeaders(
  fallbackHeaders: Array<string>,
  userHeaders: Array<string> | undefined,
): Array<string> {
  const lowerCaseUserHeaders = (userHeaders ?? []).map((header) =>
    header.toLowerCase(),
  );
  return [...fallbackHeaders, ...lowerCaseUserHeaders];
}

function mergeRedactedQueryParams(
  fallbackParams: Array<string>,
  userParams: Array<string> | undefined,
): Array<string> {
  return [...fallbackParams, ...(userParams ?? [])];
}
