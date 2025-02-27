import type { FpResolvedConfig } from "../../config";
import { getRedactedHeaders, getShouldTraceEverything } from "../../config";
import type { GlobalResponse, HonoResponse } from "../../types";

// There are so many different types of headers
// and we want to support all of them so we can
// use a single function to do it all
type PossibleHeaders =
  | Headers
  | HonoResponse["headers"]
  | GlobalResponse["headers"];

export function headersToObject(headers: PossibleHeaders) {
  const returnObject: Record<string, string> = {};
  headers.forEach((value, key) => {
    returnObject[key] = value;
  });

  return returnObject;
}

export function getSafeHeaderValue(
  key: string,
  value: string,
  config?: FpResolvedConfig,
) {
  // NOTE - `toLowerCase` might not be necessary in Hono, since Hono headers are all lower case by default,
  //         but it's good to be safe
  const lowerCaseKey = key.toLowerCase();
  const redactedHeaders = getRedactedHeaders(config);

  const shouldTraceEverything = getShouldTraceEverything(config);

  if (!shouldTraceEverything && redactedHeaders.has(lowerCaseKey)) {
    return "REDACTED";
  }

  return value;
}
