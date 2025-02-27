export { resolveConfig } from "./config";
export type { FpConfigOptions } from "./types";
export {
  getFpResolvedConfig,
  setFpResolvedConfig,
  getRedactedHeaders,
  getRedactedQueryParams,
  getShouldTraceEverything,
} from "./context";
export type { FpResolvedConfig } from "./config";
export {
  DEFAULT_REDACTED_HEADERS,
  DEFAULT_REDACTED_QUERY_PARAMS,
  DEFAULT_CONFIG,
} from "./config";
