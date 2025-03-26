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
