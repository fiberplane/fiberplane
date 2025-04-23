import { isUintArray } from "./uint";

export function safelySerializeJSON(obj: unknown): string {
  const seen = new WeakSet();
  return JSON.stringify(obj, (_key, value) => {
    // HACK - Do not serialize binary data - There is probably a smarter way to do this
    if (isUintArray(value)) {
      return "BINARY";
    }
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[Circular]";
      }
      seen.add(value);
    }
    return value;
  });
}
