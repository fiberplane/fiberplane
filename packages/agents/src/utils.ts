// Types for the result object with discriminated union
type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * A nicer way to handle errors than a try..catch block.
 *
 * Wraps a promise in a try/catch block and returns a result object with the data or error.
 * @param promiseOrValue - The promise to wrap
 * @returns A result object with the data or error
 *
 * @example
 * ```ts
 * const { data, error } = await tryCatch(somePromise);
 * if (error) {
 *   console.error(error);
 * } else {
 *   console.log(data);
 * }
 * ```
 */
export async function tryCatch<T, E = Error>(
  promiseOrValue: Promise<T> | T,
): Promise<Result<T, E>> {
  try {
    if (promiseOrValue instanceof Promise) {
      const data = await promiseOrValue;
      return { data, error: null };
    }

    return { data: promiseOrValue, error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}

// TODO - Add more introspection to see if the durable object is an agent
// which is what we are looking for
export function isDurableObjectNamespace(
  value: unknown,
): value is DurableObjectNamespace<Rpc.DurableObjectBranded | undefined> {
  return (
    typeof value === "object" &&
    value !== null &&
    value.constructor.name === "DurableObjectNamespace" &&
    "newUniqueId" in value &&
    "idFromName" in value &&
    "idFromString" in value &&
    "get" in value &&
    "jurisdiction" in value &&
    typeof value.newUniqueId === "function" &&
    typeof value.idFromName === "function" &&
    typeof value.idFromString === "function" &&
    typeof value.get === "function" &&
    typeof value.jurisdiction === "function"
  );
}

/**
 * Converts a string to kebab-case
 * @param str The input string to convert
 * @returns The kebab-case version of the input string
 */
export function toKebabCase(str: string): KebabCase<string> {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2") // Convert camelCase to kebab-case
    .replace(/[\s_]+/g, "-") // Replace spaces and underscores with hyphens
    .toLowerCase() as KebabCase<string>;
}

/**
 * Type for kebab-case strings
 * This is a branded type that ensures type safety for kebab-case strings
 */
export type KebabCase<T extends string> = T extends string
  ? string & { readonly __kebabCase: unique symbol }
  : never;
