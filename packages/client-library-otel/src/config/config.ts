import type { FpHonoEnv } from "../utils";
import {
  getLogLevel,
  getMode,
  getOtelEndpoint,
  getOtelToken,
  getServiceName,
} from "./resolvers";
import type { FpxConfig, FpxConfigOptions, FpxMode } from "./types";

export type FpResolvedConfig = {
  enabled: boolean;
  mode: FpxMode;
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

export const DEFAULT_CONFIG = Object.freeze({
  libraryDebugMode: false,
  monitor: {
    fetch: true,
    logging: true,
    cfBindings: true,
  },
});

export function resolveConfig(
  userConfig: FpxConfigOptions | undefined,
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

  return {
    ...config,
    enabled,
    mode,
    otelEndpoint,
    otelToken,
    logLevel,
    serviceName,
  };
}

/**
 * Last-in-wins deep merge for FpxConfig
 */
function mergeConfigs(
  fallbackConfig: FpxConfig,
  userConfig?: FpxConfigOptions,
): FpxConfig {
  const libraryDebugMode =
    typeof userConfig?.libraryDebugMode === "boolean"
      ? userConfig.libraryDebugMode
      : fallbackConfig.libraryDebugMode;

  return {
    libraryDebugMode,
    monitor: Object.assign({}, fallbackConfig.monitor, userConfig?.monitor),
  };
}
