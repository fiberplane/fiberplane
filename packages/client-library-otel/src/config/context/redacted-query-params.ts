import {
  DEFAULT_REDACTED_QUERY_PARAMS,
  type FpResolvedConfig,
} from "../config";
import { getFpResolvedConfig } from "./context";
/**
 * Helper function to determine which headers to redact
 */
export function getRedactedQueryParams(
  resolvedConfig?: FpResolvedConfig,
): Set<string> {
  const config = resolvedConfig ?? getFpResolvedConfig();
  return config?.redactedQueryParams ?? new Set(DEFAULT_REDACTED_QUERY_PARAMS);
}
