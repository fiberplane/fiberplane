export { getFromEnv } from "./env";
export * from "./errors";
export * from "./json";
export * from "./request";
export * from "./wrapper";
export { cloneResponse } from "./response";

export function isPromise<T>(value: unknown): value is Promise<T> {
  return value instanceof Promise;
}

export function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null;
}

export function objectWithKey<T extends string>(
  value: unknown,
  key: T,
): value is { [K in T]: unknown } {
  return isObject(value) && key in value;
}
