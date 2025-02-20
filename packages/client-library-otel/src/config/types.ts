import type { DEFAULT_REDACTED_HEADERS } from "./config";

// HACK - Just here to be able to reference the type in a docstring
type _UnusedImport = typeof DEFAULT_REDACTED_HEADERS;

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
  /** Headers whose values should always be redacted - these are merged with {@link DEFAULT_REDACTED_HEADERS} */
  redactedHeaders: Array<string>;

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
