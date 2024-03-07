import type { OpenAPIV3 } from "openapi-types";

export function hasNestedProperties(value: OpenAPIV3.SchemaObject) {
  if (!value) {
    return false;
  }

  if (value.oneOf) {
    return true;
  }

  if (value.type === "array") {
    return true;
  }

  if (value.type === "object") {
    return true;
  }

  return false;
}

export function circularStringify<T>(obj: T) {
  const seen = new WeakSet();
  return JSON.stringify(
    obj,
    (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return key;
        }
        seen.add(value);
      }
      return value;
    },
    2,
  );
}
