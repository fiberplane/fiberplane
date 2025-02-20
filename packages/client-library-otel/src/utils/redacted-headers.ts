import {
  DEFAULT_REDACTED_HEADERS,
  type FpResolvedConfig,
  getFpResolvedConfig,
} from "../config";

/**
 * Helper function to determine which headers to redact
 */
export function getRedactedHeaders(
  resolvedConfig?: FpResolvedConfig,
): Set<string> {
  const config = resolvedConfig ?? getFpResolvedConfig();
  return config?.redactedHeaders ?? new Set(DEFAULT_REDACTED_HEADERS);
}
