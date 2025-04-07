export function isObject(value: unknown): value is object {
  return typeof value === "object" && value !== null;
}

export function objectWithKey<T extends string>(
  value: unknown,
  key: T,
): value is { [K in T]: unknown } {
  return isObject(value) && key in value;
}
