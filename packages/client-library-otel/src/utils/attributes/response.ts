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
  EXTRA_SEMATTRS_HTTP_RESPONSE_STATUS_CODE,
  FPX_RESPONSE_BODY,
} from "../../constants";
import { getLogger } from "../../logger";
import type { GlobalResponse, HonoResponse } from "../../types/hono-types";
import { tryGetResponseBodyAsText } from "./body";
import { getSafeHeaderValue, headersToObject } from "./headers";

export async function getResponseAttributes(
  response: GlobalResponse | HonoResponse,
  config?: FpResolvedConfig,
) {
  const resolvedConfig = config ?? getFpResolvedConfig();
  const shouldTraceEverything = getShouldTraceEverything(resolvedConfig);
  const logger = getLogger(resolvedConfig?.logLevel ?? "debug");
  if (!resolvedConfig) {
    logger.debug(
      "[getResponseAttributes] No config found in otel context, using default values",
    );
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
