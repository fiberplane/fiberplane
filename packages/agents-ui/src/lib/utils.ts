import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { OptionsSchema } from "../types";

type Success<T> = {
  data: T;
  error: null;
};

type Failure<E> = {
  data: null;
  error: E;
};

type Result<T, E = Error> = Success<T> | Failure<E>;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function noop() {}

/**
 * Returns a string representation of the HTTP method.
 *
 * In practice, shortens the method name to be 3-5 characters.
 */
export function getHttpMethodString(method: string) {
  return {
    GET: "GET",
    POST: "POST",
    PUT: "PUT",
    PATCH: "PATCH",
    DELETE: "DEL",
    OPTIONS: "OPT",
    HEAD: "HEAD",
    TRACE: "TRACE",
  }[String(method).toUpperCase()];
}

export function getHttpMethodTextColor(method: string) {
  return {
    GET: "text-info",
    POST: "text-success",
    PUT: "text-warning",
    PATCH: "text-warning",
    DELETE: "text-danger",
    OPTIONS: "text-info",
    HEAD: "text-info",
    TRACE: "text-info",
  }[String(method).toUpperCase()];
}

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
 * @param fn - An async function that might throw an error
 * @returns A promise that resolves to a result object with the data or error
 *
 * @example
 * ```ts
 * const { data, error } = await tryCatchAsync(async () => await somePromise);
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

/**
 * Parses the embedded options from the root element using Zod for validation.
 *
 * @param rootElement - The HTML element containing data-options
 * @returns Validated options with defaults applied
 */
export function parseOptions(rootElement: HTMLElement) {
  const optionsString = rootElement.dataset.options;
  if (!optionsString) {
    return OptionsSchema.parse({});
  }

  const { data, error } = tryCatch(() => {
    const parsedData = JSON.parse(optionsString);
    return OptionsSchema.parse(parsedData);
  });

  if (error) {
    console.error("Error parsing options", error);
    return OptionsSchema.parse({});
  }

  return data;
}
