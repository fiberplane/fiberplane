import type { FpResolvedConfig } from "../../config";
import { getRedactedQueryParams, getShouldTraceEverything } from "../../config";

export function getRedactedUrl(url: URL, config?: FpResolvedConfig): string {
  const shouldTraceEverything = getShouldTraceEverything(config);

  if (shouldTraceEverything) {
    return url.toString();
  }

  const redactedUrl = new URL(url.toString());
  const redactedQueryParams = getRedactedQueryParams(config);

  for (const [key] of redactedUrl.searchParams.entries()) {
    if (redactedQueryParams.has(key.toLowerCase())) {
      redactedUrl.searchParams.set(key, "REDACTED");
    }
  }

  return redactedUrl.toString();
}
