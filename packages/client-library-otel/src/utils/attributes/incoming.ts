import type { Attributes } from "@opentelemetry/api";
import {
  type FpResolvedConfig,
  getFpResolvedConfig,
  getShouldTraceEverything,
} from "../../config";
import { FPX_REQUEST_ENV } from "../../constants";
import { getLogger } from "../../logger";
import { getPlatformSafeEnv } from "../env";
import { safelySerializeJSON } from "../json";
import { formatRootRequestBody } from "./body";
import { getSafeHeaderValue, headersToObject } from "./headers";

/**
 * Helper to get the request attributes for the root request.
 *
 * When tracing e.v.e.r.y.t.h.i.n.g, this requires that we have a cloned request,
 * so we can get the body and headers without consuming the original request.
 */
export async function getIncomingRequestAttributes(
  request: Request,
  honoEnv: unknown,
  config: FpResolvedConfig,
) {
  const resolvedConfig = config ?? getFpResolvedConfig();
  const shouldTraceEverything = getShouldTraceEverything(resolvedConfig);
  const logger = getLogger(resolvedConfig?.logLevel ?? "debug");
  if (!resolvedConfig) {
    logger.debug("No config found in otel context, using default values");
  }

  let attributes: Attributes = {};

  // NOTE - In practice, we only send env vars when running in "local" mode
  if (shouldTraceEverything) {
    // We need to account for the fact that the Hono `env` is different across runtimes
    // If process.env is available, we use that, otherwise we use the `env` object from the Hono runtime
    const env = getPlatformSafeEnv(honoEnv);
    if (env) {
      attributes[FPX_REQUEST_ENV] = safelySerializeJSON(env);
    }
  }

  if (shouldTraceEverything && request.body) {
    const bodyAttr = await formatRootRequestBody(request);
    if (bodyAttr) {
      attributes = {
        ...attributes,
        ...bodyAttr,
      };
    }
  }

  if (request.headers) {
    const headers = headersToObject(new Headers(request.headers));
    for (const [key, value] of Object.entries(headers)) {
      // Redact sensitive headers when running in production
      attributes[`http.request.header.${key}`] = getSafeHeaderValue(
        key,
        value,
        resolvedConfig,
      );
    }
  }

  return attributes;
}
