import type { Attributes } from "@opentelemetry/api";
import {
  type FpResolvedConfig,
  getFpResolvedConfig,
  getShouldTraceEverything,
} from "../../config";
import {
  EXTRA_SEMATTRS_HTTP_REQUEST_METHOD,
  EXTRA_SEMATTRS_URL_FULL,
  FPX_REQUEST_BODY,
  FPX_REQUEST_PATHNAME,
  FPX_REQUEST_SCHEME,
  FPX_REQUEST_SEARCH,
} from "../../constants";
import { getLogger } from "../../logger";
import type { InitParam, InputParam } from "../../types/hono-types";
import { formatBody } from "./body";
import { getSafeHeaderValue, headersToObject } from "./headers";
import { getRedactedUrl } from "./url";

/**
 * Get the request attributes for a given request.
 *
 * The `config` param is optional, and if not provided,
 * we will try to use the config that's currently in the active OpenTelemetry context.
 */
export function getRequestAttributes(
  input: InputParam,
  init: InitParam | undefined,
  config?: FpResolvedConfig,
) {
  const resolvedConfig = config ?? getFpResolvedConfig();
  const shouldTraceEverything = getShouldTraceEverything(resolvedConfig);
  const logger = getLogger(resolvedConfig?.logLevel ?? "debug");
  if (!resolvedConfig) {
    logger.debug(
      "[getRequestAttributes] No config found in otel context, using default values",
    );
    logger.debug("input", input);
    if (input instanceof Request) {
      logger.debug("input.url", input.url);
    }
  }

  const requestMethod =
    typeof input === "string" || input instanceof URL ? "GET" : input.method;
  const requestUrl = input instanceof Request ? input.url : input;
  const url = new URL(requestUrl);
  const urlScheme = url.protocol.replace(":", "");
  const attributes: Attributes = {
    [EXTRA_SEMATTRS_HTTP_REQUEST_METHOD]: requestMethod,
    // [HTTP_REQUEST_METHOD_ORIGINAL]: request.method,
    // TODO: remove login/password from URL (if we want to follow
    // the otel spec for this attribute)
    // TODO: think about how to handle a redirect
    [EXTRA_SEMATTRS_URL_FULL]: getRedactedUrl(url),
    // Bunch of custom attributes even though some experimental
    // packages from otel already have similar attributes
    [FPX_REQUEST_PATHNAME]: url.pathname,
    [FPX_REQUEST_SEARCH]: getRedactedUrl(url).split("?")[1] || "",
    // TODO: Add path
    // [SEMATTRS_]
    [FPX_REQUEST_SCHEME]: urlScheme,
  };

  // Init should not be null or undefined - but we do call it with undefined for the root request
  if (init) {
    const { body } = init;
    if (!shouldTraceEverything && body != null) {
      attributes[FPX_REQUEST_BODY] = formatBody(body);
    }

    if (init.headers) {
      const headers = headersToObject(new Headers(init.headers));
      for (const [key, value] of Object.entries(headers)) {
        // Redact sensitive headers when running in production
        attributes[`http.request.header.${key}`] = getSafeHeaderValue(
          key,
          value,
          resolvedConfig,
        );
      }
    }
  }

  return attributes;
}
