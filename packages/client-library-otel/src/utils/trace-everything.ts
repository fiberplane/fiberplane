import { type FpResolvedConfig, getFpResolvedConfig } from "../config";

/**
 * Helper function to determine whether we want to record potentially sensitive data
 * inside trace attributes.
 *
 * Optionally takes a config argument, but falls back to whatever is set on the OpenTelemetry context.
 *
 * If this returns true, then traces will include things like:
 * - environment variables
 * - sensitive req/res headers
 * - results from database queries
 * - etc., etc.,
 */
export function getShouldTraceEverything(
  resolvedConfig?: FpResolvedConfig,
): boolean {
  const config = resolvedConfig ?? getFpResolvedConfig();
  const isLocal = config?.mode === "local";
  return isLocal;
}
