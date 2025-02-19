export interface EmbeddedOptions {
  /**
   * OpenAPI spec to use for the embedded playground.
   * Pass either a `url` property to the JSON spec document,
   * or a `content` property to the JSON-stringified spec document.
   *
   * @example
   * ```ts
   * const app = new Hono();
   *
   * // app code...
   *
   * app.use('/*', createFiberplane({
   *   openapi: {
   *     url: '/openapi.json',
   *     // or
   *     content: JSON.stringify({
   *       openapi: '3.0.0',
   *       info: { title: 'My API', version: '1.0.0' },
   *       paths: { ... }
   *     })
   *   }
   * }));
   * ```
   */
  openapi?: OpenAPIOptions;

  /**
   * (Optional) Fiberplane API key to use for the embedded playground api.
   *
   * The middleware will attempt to fall back to the `FIBERPLANE_API_KEY` environment variable if not set as an option.
   *
   * _Without an API key, certain features like the Workflow Builder will be disabled._
   */
  apiKey?: string;

  /**
   * (Optional) URL of a custom CDN to use for the embedded playground UI.
   *
   * If not provided, the default CDN will be used.
   */
  cdn?: string;

  /**
   * (Optional) URL of the Fiberplane OpenTelemetry collector endpoint.
   *
   * If not provided, the middleware will attempt to fall back to the `FIBERPLANE_OTEL_ENDPOINT` environment variable.
   * If provided, the middleware will use this endpoint for sending telemetry data, ignoring the `FIBERPLANE_OTEL_ENDPOINT` environment variable.
   *
   * @example
   * ```ts
   * const app = new Hono();
   * app.use('/*', createFiberplane({
   *   otelEndpoint: 'https://otel.mydomain.com/v1/traces'
   * }));
   * ```
   */
  otelEndpoint?: string;

  /**
   * (Optional) OpenTelemetry token to use for the embedded playground api.
   *
   * If not provided, the middleware will attempt to fall back to the `FIBERPLANE_OTEL_TOKEN` environment variable.
   */
  otelToken?: string;

  /**
   * Enable debug statements
   */
  debug?: boolean;
}

export interface ResolvedEmbeddedOptions extends EmbeddedOptions {
  mountedPath: string;
}

export interface SanitizedEmbeddedOptions
  extends Omit<ResolvedEmbeddedOptions, "apiKey"> {}

export interface OpenAPIOptions {
  /**
   * The URL of the (JSON) OpenAPI spec.
   *
   * Examples:
   * - Same origin: "/openapi.json"
   * - Different origin: "http://api.myapp.biz/openapi.json"
   */
  url?: string;
  /**
   * A JSON-stringified object representing an OpenAPI spec.
   */
  content?: string;
}

export interface FiberplaneAppType {
  Variables: {
    debug: boolean;
  };
}
