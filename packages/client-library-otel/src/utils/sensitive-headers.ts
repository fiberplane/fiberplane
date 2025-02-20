import {
  DEFAULT_SENSITIVE_HEADERS,
  type FpResolvedConfig,
  getFpResolvedConfig,
} from "../config";

/**
 * Helper function to determine which headers to redact
 */
export function getSensitiveHeaders(
  resolvedConfig?: FpResolvedConfig,
): Set<string> {
  const config = resolvedConfig ?? getFpResolvedConfig();
  return config?.sensitiveHeaders ?? new Set(DEFAULT_SENSITIVE_HEADERS);
}
