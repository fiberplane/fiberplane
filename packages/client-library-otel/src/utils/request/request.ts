import type { Attributes } from "@opentelemetry/api";
import {
  SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH,
  SEMATTRS_HTTP_SCHEME,
} from "@opentelemetry/semantic-conventions";
import {
  type FpResolvedConfig,
  getFpResolvedConfig,
  getShouldTraceEverything,
} from "../../config";
import {
  EXTRA_SEMATTRS_HTTP_REQUEST_METHOD,
  EXTRA_SEMATTRS_HTTP_RESPONSE_STATUS_CODE,
  EXTRA_SEMATTRS_URL_FULL,
  FPX_REQUEST_BODY,
  FPX_REQUEST_ENV,
  FPX_REQUEST_PATHNAME,
  FPX_REQUEST_SCHEME,
  FPX_REQUEST_SEARCH,
  FPX_RESPONSE_BODY,
} from "../../constants";
import { getLogger } from "../../logger";
import type {
  GlobalResponse,
  HonoResponse,
  InitParam,
  InputParam,
} from "../../types/hono-types";
import { getPlatformSafeEnv } from "../env";
import { safelySerializeJSON } from "../json";
import {
  formatBody,
  formatRootRequestBody,
  tryGetResponseBodyAsText,
} from "./body";
import { getSafeHeaderValue, headersToObject } from "./headers";
import { getRedactedUrl } from "./url";

/**
 * Helper to get the request attributes for the root request.
 *
 * When tracing e.v.e.r.y.t.h.i.n.g, this requires that we have a cloned request,
 * so we can get the body and headers without consuming the original request.
 */
export async function getRootRequestAttributes(
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
    logger.debug("No config found in otel context, using default values");
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

export async function getResponseAttributes(
  response: GlobalResponse | HonoResponse,
  config?: FpResolvedConfig,
) {
  const resolvedConfig = config ?? getFpResolvedConfig();
  const shouldTraceEverything = getShouldTraceEverything(resolvedConfig);
  const logger = getLogger(resolvedConfig?.logLevel ?? "debug");
  if (!resolvedConfig) {
    logger.debug("No config found in otel context, using default values");
  }

  const attributes: Attributes = {
    [EXTRA_SEMATTRS_HTTP_RESPONSE_STATUS_CODE]: String(response.status),
    [SEMATTRS_HTTP_SCHEME]: response.url.split(":")[0],
  };

  if (shouldTraceEverything) {
    const responseText = await tryGetResponseBodyAsText(response);
    if (responseText) {
      attributes[FPX_RESPONSE_BODY] = responseText;
    }
  }

  const contentLength = response.headers.get("content-length");
  if (contentLength) {
    attributes[SEMATTRS_HTTP_RESPONSE_CONTENT_LENGTH] = contentLength;
  }

  const headers = response.headers;
  const responseHeaders = headersToObject(headers);
  for (const [key, value] of Object.entries(responseHeaders)) {
    attributes[`http.response.header.${key}`] = getSafeHeaderValue(
      key,
      value,
      resolvedConfig,
    );
  }

  return attributes;
}

export function cloneRequestForAttributes(
  request: Request,
  resolvedConfig: FpResolvedConfig,
) {
  const shouldTraceEverything = getShouldTraceEverything(resolvedConfig);

  if (!shouldTraceEverything) {
    return { requestForAttributes: request, newRequest: request };
  }

  // HACK - Duplicate request to be able to read the body and other metadata
  //        in the middleware without messing up the original request
  const clonedRequest = shouldTraceEverything ? request.clone() : request;
  const [body1, body2] = clonedRequest.body
    ? clonedRequest.body.tee()
    : [null, null];

  // In order to keep `onStart` synchronous (below), we construct
  // some necessary attributes here, using a cloned request
  const requestForAttributes = new Request(clonedRequest.url, {
    method: request.method,
    headers: new Headers(request.headers),
    body: body1,

    // NOTE - This is a workaround to support node environments
    //        Which will throw errors when body is a stream but duplex is not set
    //        https://github.com/nodejs/node/issues/46221
    // @ts-expect-error - duplex is available in nodejs-compat but cloudflare types
    // don't seem to pick it up
    duplex: body1 ? "half" : undefined,
  });

  // Replace the original request's body with the second stream
  const newRequest = shouldTraceEverything
    ? new Request(clonedRequest, {
        body: body2,
        headers: new Headers(request.headers),
        method: request.method,
        // NOTE - This is a workaround to support node environments
        //        Which will throw errors when body is a stream but duplex is not set
        //        https://github.com/nodejs/node/issues/46221
        // @ts-expect-error - duplex is available in nodejs-compat but cloudflare types
        // don't seem to pick it up
        duplex: body2 ? "half" : undefined,
      })
    : request;

  return {
    requestForAttributes,
    newRequest,
  };
}
