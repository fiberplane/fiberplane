/**
 * The type for the configuration object passed to `instrument`,
 * all properties should be optional.
 *
 * @public
 */
export type FpxConfigOptions = Partial<
  FpxConfig & {
    monitor: Partial<FpxConfig["monitor"]>;
    mode?: "local" | "production";
  }
>;
/**
 * The type for the configuration object we use to configure the instrumentation
 * Different from @FpxConfigOptions because all properties are required
 *
 * @internal
 */
export type FpxConfig = {
  /** Enable library debug logging */
  libraryDebugMode: boolean;
  monitor: {
    /** Send data to FPX about each `fetch` call made during a handler's lifetime */
    fetch: boolean;
    /** Send data to FPX about each `console.*` call made during a handler's lifetime */
    logging: boolean;
    /** Proxy Cloudflare bindings to add instrumentation */
    cfBindings: boolean;
  };
};
