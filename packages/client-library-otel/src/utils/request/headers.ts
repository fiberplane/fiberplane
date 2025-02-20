import type { FpResolvedConfig } from "../../config";
import { getRedactedHeaders, getShouldTraceEverything } from "../../config";

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
