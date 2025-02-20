import type {
  DEFAULT_REDACTED_HEADERS,
  DEFAULT_REDACTED_QUERY_PARAMS,
} from "./config";

// HACK - These lines are here to be able to reference these constant types in a docstring
type _UnusedImport1 = typeof DEFAULT_REDACTED_HEADERS;
type _UnusedImport2 = typeof DEFAULT_REDACTED_QUERY_PARAMS;

/**
 * Runtime mode of the client library.
 * - "local" mode will send the kitchen sink with every trace: env vars, request bodies, etc.
 * - "production" mode will attempt to redact sensitive data, and not send request bodies, env vars, etc.
 */
export type FpxMode = "local" | "production";

/**
 * The type for the configuration object passed to `instrument`,
 * all properties should be optional.
 *
 * @public
 */
export type FpxConfigOptions = Partial<
  FpxConfig & {
    monitor: Partial<FpxConfig["monitor"]>;
    mode?: FpxMode;
  }
>;
/**
 * The type for the configuration object we use to configure the instrumentation
 * Different from @FpxConfigOptions because all properties are required
 *
 * @internal
 */
export type FpxConfig = {
  /**
   * Headers whose values should always be redacted
   * These are merged with {@link DEFAULT_REDACTED_HEADERS}
   *
   * @NOTE - Headers are not redacted when FIBERPLANE_ENVIRONMENT is set to "local"
   */
  redactedHeaders: Array<string>;

  /**
   * Query params whose values should always be redacted
   * These are merged with {@link DEFAULT_REDACTED_QUERY_PARAMS}
   *
   * @NOTE - Query params are not redacted when FIBERPLANE_ENVIRONMENT is set to "local"
   */
  redactedQueryParams: Array<string>;

  monitor: {
    /** Send data to FPX about each `fetch` call made during a handler's lifetime */
    fetch: boolean;
    /** Send data to FPX about each `console.*` call made during a handler's lifetime */
    logging: boolean;
    /** Proxy Cloudflare bindings to add instrumentation */
    cfBindings: boolean;
  };

  /** Enable library debug logging */
  libraryDebugMode: boolean;
};
