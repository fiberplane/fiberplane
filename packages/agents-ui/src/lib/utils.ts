import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { type RouterOptions, OptionsSchema } from "../types";

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

/**
 * Parses the embedded options from the root element using Zod for validation.
 *
 * @param rootElement - The HTML element containing data-options
 * @returns Validated options with defaults applied
 */
export async function parseOptions(
  rootElement: HTMLElement,
): Promise<RouterOptions> {
  const optionsString = rootElement.dataset.options;
  if (!optionsString) {
    return OptionsSchema.parse({});
  }

  const parseOptionsImpl = () => {
    const parsedData = JSON.parse(optionsString);
    return OptionsSchema.parseAsync(parsedData);
  };

  const { data, error } = await tryCatch(await parseOptionsImpl());

  if (error) {
    console.error("Error parsing options", error);
    return OptionsSchema.parse({});
  }

  return data;
}
