import { type ClassValue, clsx } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export * from "./screen-size";
export * from "./otel-helpers";
export * from "./vendorify-traces";
export { isSensitiveEnvVar } from "./env-vars";
export { renderFullLogMessage } from "./render-log-message";
export { truncateWithEllipsis } from "./truncate";
export { parseEmbeddedConfig } from "./config-parser";
export { getHttpMethodTextColor } from "./http-method-color";
export { getHttpMethodString } from "./http-method-string";
export { safeParseJson } from "./safe-parse-json";
export function formatDate(d: Date | string) {
  return format(new Date(d), "HH:mm:ss.SSS");
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function objectWithKey<T extends string>(
  value: unknown,
  key: T,
): value is { [K in T]: unknown } {
  return typeof value === "object" && value !== null && key in value;
}

export function objectWithKeyAndValue<T extends string, V>(
  value: unknown,
  key: T,
  expectedValue: V,
): value is { [K in T]: V } {
  return objectWithKey(value, key) && value[key] === expectedValue;
}

export function noop() {}

export function objectHasStack(error: unknown): error is { stack: string } {
  return objectWithKey(error, "stack") && typeof error.stack === "string";
}

export const isMac =
  typeof navigator !== "undefined" &&
  navigator.platform.toUpperCase().indexOf("MAC") >= 0;

export const SENSITIVE_HEADERS = [
  "authorization",
  "cookie",
  "set-cookie",
  "neon-connection-string",
];
