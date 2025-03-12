import type { OpenAPIHono } from "@hono/zod-openapi";
import type { Env, ExecutionContext, Hono } from "hono";

export type FetchFn = typeof fetch;

type AnyHono<E extends Env> = Hono<E> | OpenAPIHono<E>;

export interface EmbeddedOptions<E extends Env> {
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
   * (Optional) URL of the Fiberplane services endpoint.
   *
   * The middleware will attempt to fall back to the `FIBERPLANE_SERVICES_URL`
   * environment variable if not set directly as an option.
   *
   * If not provided, the default endpoint will be used.
   */
  fiberplaneServicesUrl?: string;

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
   * (Optional) Token to use for bearer auth against the OpenTelemetry collector (`otelEndpoint`)
   *
   * If not provided, the middleware will attempt to fall back to the `FIBERPLANE_OTEL_TOKEN` environment variable.
   */
  otelToken?: string;

  /**
   * The Hono app to use for the embedded runner.
   */
  app?: AnyHono<E>;

  /**
   * A custom fetch function to use for internal fiberplane api requests.
   *
   * If not provided, a web standard fetch function will be used.
   */
  fetch?: FetchFn;

  /**
   * (Optional) Configuration for the chat feature
   * 
   * @example
   * ```ts
   * const app = new Hono();
   * app.use('/*', createFiberplane({
   *   chat: {
   *     enabled: true,
   *     // Optional: provide a custom API key, otherwise uses FIBERPLANE_AI_API_KEY env var
   *     // apiKey: 'your-ai-provider-api-key'
   *   }
   * }));
   * ```
   */
  chat?: ChatConfig;

  /**
   * Enable debug statements
   */
  debug?: boolean;
}

export interface ResolvedEmbeddedOptions<E extends Env>
  extends Omit<EmbeddedOptions<E>, "cdn" | "fiberplaneServicesUrl"> {
  // cdn is required in resolved options
  mountedPath: string;
  otelEndpoint?: string;
  otelToken?: string;
  userApp?: AnyHono<E>;
  userEnv: Env;
  userExecutionCtx: ExecutionContext | null;
  cdn: string;
  fiberplaneServicesUrl: string;
  chat?: ChatConfig;
}

export interface SanitizedEmbeddedOptions<E extends Env>
  extends Omit<
    ResolvedEmbeddedOptions<E>,
    "apiKey" | "fiberplaneServicesUrl" | "chat"
  > {
  chatEnabled?: boolean;
}

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

/**
 * Configuration for the chat feature
 */
export interface ChatConfig {
  /**
   * Whether the chat feature is enabled
   */
  enabled: boolean;
  /**
   * API key for the AI provider (e.g., OpenAI)
   * If not provided, the middleware will attempt to fall back to the `FIBERPLANE_AI_API_KEY` environment variable.
   */
  apiKey?: string;
}

export interface FiberplaneAppType<E extends Env> {
  Variables: {
    debug: boolean;
    userApp?: AnyHono<E>;
    userEnv: E;
    userExecutionCtx: ExecutionContext;
    chatEnabled?: boolean;
  };
}

export type ValidationDetail = {
  key: string;
  message: string;
  code: string;
};

export type ValidationErrorInformation = {
  type: "VALIDATION_ERROR";
  message: string;
  payload: Array<ValidationDetail>;
};

export type ExecutionErrorInformation = {
  type: "EXECUTION_ERROR";
  message: string;
  payload: {
    stepId: string;
    // Somewhat internal information, these are the parameters as they are
    // passed into the step function and are used to reconstruct the request
    // in the playground.
    parameters?: Record<string, unknown>;

    // Contains key request information
    // Note: this might leek sensitive information
    // but only in cases where the workflow is used to
    // call non-public APIs
    request?: {
      url: string;
      method: string;
      headers: Record<string, string>;
      body?: string;
    };

    // Contains key response information
    response?: {
      status: number;
      body?: string;
      headers: Record<string, string>;
    };
  };
};
