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
 * Wraps a function in a try/catch block and returns a result object with the data or error.
 * @param fn - A function that might throw an error
 * @returns A result object with the data or error
 *
 * @example
 * ```ts
 * const { data, error } = tryCatch(() => someSyncOperation());
 * if (error) {
 *   console.error(error);
 * } else {
 *   console.log(data);
 * }
 * ```
 */
export function tryCatch<T, E = Error>(fn: () => T): Result<T, E> {
  try {
    return { data: fn(), error: null };
  } catch (error) {
    return { data: null, error: error as E };
  }
}

/**
 * A nicer way to handle errors than a try..catch block.
 *
 * Wraps an async function in a try/catch block and returns a result object with the data or error.
 * @param promise - A promise that might reject
 * @returns A promise that resolves to a result object with the data or error
 *
 * @example
 * ```ts
 * const { data, error } = await tryCatchAsync(somePromise);
 * if (error) {
 *   console.error(error);
 * } else {
 *   console.log(data);
 * }
 * ```
 */
export async function tryCatchAsync<T, E = Error>(
  promise: Promise<T>,
): Promise<Result<T, E>> {
  try {
    const data = await promise;
    return { data, error: null };
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
