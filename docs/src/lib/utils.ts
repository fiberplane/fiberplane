// FIXME: type me
export function hasNestedProperties(value) {
  if (!value) {
    return false;
  }

  if (value.oneOf) {
    return true;
  }

  if (value?.items?.oneOf) {
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
