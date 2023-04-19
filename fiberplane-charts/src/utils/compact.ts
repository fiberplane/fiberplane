/**
 * Strips all falsy values from an array.
 */
export function compact<T>(
  items: Array<T | false | undefined | null | 0 | "">,
): Array<T> {
  return items.filter(Boolean) as Array<T>;
}
