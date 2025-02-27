import { isObject } from "./object";

export function isPromiseLike<T>(value: unknown): value is PromiseLike<T> {
  return (
    isObject(value) &&
    "then" in value &&
    typeof (value as { then: unknown }).then === "function"
  );
}
