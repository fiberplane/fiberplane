import { SpanKind, context } from "@opentelemetry/api";
import { Resource } from "@opentelemetry/resources";
import {
  BasicTracerProvider,
  // BatchSpanProcessor,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { SEMRESATTRS_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import type { ExecutionContext } from "hono";
// TODO figure out if we can use something else
import { AsyncLocalStorageContextManager } from "./async-hooks";
import {
  type FpConfigOptions,
  resolveConfig,
  setFpResolvedConfig,
} from "./config";
import { FPOTLPExporter } from "./exporter";
import { type FpxLogger, getLogger } from "./logger";
import { measure } from "./measure";
import {
  patchCloudflareBindings,
  patchConsole,
  patchFetch,
  patchWaitUntil,
} from "./patch";
import { PromiseStore } from "./promiseStore";
import { propagateFpxTraceId } from "./propagation";
import type { FetchFn, HonoLikeApp, HonoLikeEnv, HonoLikeFetch } from "./types";
import {
  type FpHonoEnv,
  cloneRequestForAttributes,
  getIncomingRequestAttributes,
  getRequestAttributes,
  getResponseAttributes,
} from "./utils";

// Freeze the web standard fetch function so that we can use it without creating new spans
// In the future, we could allow the user to set their own custom "fetchFn"
const webStandardFetch = fetch;

export function instrument(app: HonoLikeApp, userConfig?: FpConfigOptions) {
  return new Proxy(app, {
    // Intercept the `fetch` function on the Hono app instance
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (prop === "fetch" && typeof value === "function") {
        const originalFetch = value as HonoLikeFetch;
        return async function fetch(
          request: Request,
          // Named this "rawEnv" because we coerce it below
          rawEnv: HonoLikeEnv,
          executionContext?: ExecutionContext,
        ) {
          // Coerce the rawEnv to an FpHonoEnv, since it's easier to work with
          const env = rawEnv as FpHonoEnv;

          const resolvedConfig = resolveConfig(userConfig, env);
          const {
            otelEndpoint,
            otelToken,
            serviceName,
            monitor: {
              fetch: monitorFetch,
              logging: monitorLogging,
              cfBindings: monitorCfBindings,
            },
          } = resolvedConfig;

          const logger = getLogger(resolvedConfig.logLevel);

          // NOTE - Only prints if debug mode is enabled
          logger.debug("Library debug logging is enabled");

          logger.debug(`Library mode: ${resolvedConfig.mode}`);

          if (!resolvedConfig.enabled || !otelEndpoint) {
            logger.debug(
              "Missing FIBERPLANE_OTEL_ENDPOINT. Skipping instrumentation",
            );
            return await originalFetch(request, rawEnv, executionContext);
          }

          // Ignore instrumentation for requests that have the x-fpx-ignore header
          // This is a useful escape hatch, please keep that in mind if you're tempted to remove it.
          if (request.headers.get("x-fpx-ignore")) {
            logger.debug(
              "Ignoring request due to x-fpx-ignore header: ",
              request.url?.toString?.(),
            );
            return await originalFetch(request, rawEnv, executionContext);
          }

          // Patch all functions we want to monitor in the runtime
          if (monitorCfBindings) {
            patchCloudflareBindings(env);
          }
          if (monitorLogging) {
            patchConsole();
          }
          if (monitorFetch) {
            patchFetch();
          }

          const promiseStore = new PromiseStore();

          const provider = setupTracerProvider({
            serviceName,
            otelEndpoint,
            otelToken,
            fetchFn: webStandardFetch,
            promiseStore,
            logger,
          });

          // Enable tracing for waitUntil (Cloudflare only - allows us to still trace promises that extend beyond the life of the request itself)
          const proxyExecutionCtx =
            executionContext && patchWaitUntil(executionContext, promiseStore);

          // Create the context for the request
          // - Propagate the trace ID
          // - Set the resolved config
          let activeContext = propagateFpxTraceId(request);
          activeContext = setFpResolvedConfig(activeContext, resolvedConfig);

          const { requestForAttributes, newRequest } =
            cloneRequestForAttributes(request, resolvedConfig);

          // Parse the headers for the root request.
          // In "local" mode, this will also parse the body, which does add some latency.
          // NOTE - We invoke this outside of the measure call, so that we can use the cloned request body for attributes in "local" mode
          const rootRequestAttributes = await getIncomingRequestAttributes(
            requestForAttributes,
            env,
            resolvedConfig,
          );

          const measuredFetch = measure(
            {
              name: "request",
              spanKind: SpanKind.SERVER,
              onStart: (span, [request]) => {
                const requestAttributes = {
                  ...getRequestAttributes(request, undefined, resolvedConfig),
                  ...rootRequestAttributes,
                };
                span.setAttributes(requestAttributes);
              },
              endSpanManually: true,
              onSuccess: async (span, response) => {
                span.addEvent("first-response");

                const updateSpan = async (response: Response) => {
                  const attributes = await getResponseAttributes(
                    response,
                    resolvedConfig,
                  );
                  span.setAttributes(attributes);
                  span.end();
                };

                promiseStore.add(updateSpan(response));
              },
              checkResult: async (result) => {
                const r = await result;
                if (r.status >= 500) {
                  throw new Error(r.statusText);
                }
              },
              logger,
            },
            originalFetch,
          );

          try {
            return await context.with(activeContext, () =>
              measuredFetch(newRequest, rawEnv, proxyExecutionCtx),
            );
          } finally {
            // Make sure all promises are resolved before sending data to the server
            if (proxyExecutionCtx) {
              logger.debug(
                "Waiting for promises to resolve before flushing traces",
              );
              proxyExecutionCtx.waitUntil(
                promiseStore.allSettled().finally(() => {
                  logger.debug("Force flushing traces");
                  return provider.forceFlush();
                }),
              );
            } else {
              // Otherwise just await flushing the provider
              logger.debug("No execution context: Force flushing traces");
              await provider.forceFlush();
            }
          }
        };
      }

      // Keep all the other things accessible
      return value;
    },
  });
}

function setupTracerProvider(options: {
  serviceName: string;
  otelEndpoint: string;
  otelToken: string | null;
  fetchFn: FetchFn;
  promiseStore: PromiseStore;
  logger: FpxLogger;
}) {
  const {
    otelEndpoint,
    otelToken,
    serviceName,
    fetchFn,
    promiseStore,
    logger,
  } = options;

  // We need to use async hooks to be able to propagate context
  const asyncHooksContextManager = new AsyncLocalStorageContextManager();
  asyncHooksContextManager.enable();
  context.setGlobalContextManager(asyncHooksContextManager);

  const provider = new BasicTracerProvider({
    resource: new Resource({
      [SEMRESATTRS_SERVICE_NAME]: serviceName,
    }),
  });

  const headers: Record<string, string> = otelToken
    ? { Authorization: `Bearer ${otelToken}` }
    : {};

  const exporter = new FPOTLPExporter(
    {
      url: otelEndpoint,
      headers,
    },
    // NOTE - We bind the fetch function to globalThis so that it can be called
    //        without a specific context. Otherwise, I got a runtime error.
    fetchFn.bind(globalThis),
    promiseStore,
    logger,
  );

  provider.addSpanProcessor(
    new SimpleSpanProcessor(exporter),
    // new BatchSpanProcessor(exporter, {
    //   maxQueueSize: 1000,
    //   scheduledDelayMillis: 2,
    // }),
  );
  provider.register();

  return provider;
}
