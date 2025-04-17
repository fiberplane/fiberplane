import type { Agent } from "agents";
import { getAgents } from "./agentInstances";

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

export function getDurableObjectAgentNamespace(
  env: unknown,
  name: string,
): undefined | DurableObjectNamespace<Agent<unknown, unknown>> {
  const agents = getAgents();
  const namespace = toPascalCase(name);

  const agent = agents.find((agent) => agent.id === name);
  if (!agent) {
    return;
  }

  const durableObject =
    env && typeof env === "object" && namespace in env
      ? (env as Record<string, unknown>)[namespace]
      : null;

  if (!isDurableObjectNamespace(durableObject)) {
    return;
  }

  return durableObject as unknown as DurableObjectNamespace<
    Agent<unknown, unknown>
  >;
}

export function isDurableObjectAgent(
  value: unknown,
): value is DurableObjectNamespace<Agent<unknown, unknown>> {
  return isDurableObjectNamespace(value);
  // Note: In the future, we could add more specific checks if needed
  // to verify that the namespace is specifically for an Agent
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
 * Converts a string to PascalCase (capitalized camelCase)
 * @param str The input string to convert
 * @returns The PascalCase version of the input string
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/-./g, (match) => match[1].toUpperCase()) // Convert kebab-case to camelCase
    .replace(/^./g, (match) => match.toUpperCase()) // Capitalize the first letter
    .replace(/_/g, " "); // Replace underscores with spaces
}

/**
 * Type for kebab-case strings
 * This is a branded type that ensures type safety for kebab-case strings
 */
export type KebabCase<T extends string> = T extends string
  ? string & { readonly __kebabCase: unique symbol }
  : never;

export function isPromiseLike<T>(obj: unknown): obj is PromiseLike<T> {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "then" in obj &&
    typeof obj.then === "function"
  );
}

export function headersToObject(headers: Headers) {
  const result: Record<string, string> = {};
  headers.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

export async function createResponsePayload(response: Response) {
  let body: string | undefined;

  // Check if the response has a body and read it
  if (response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    body = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      // Decode the value and append it to the body
      // Use the decoder to convert the Uint8Array to a string
      // and append it to the body
      body += decoder.decode(value, { stream: true });
    }
  }

  // Create the payload object
  return {
    status: response.status,
    statusText: response.statusText,
    headers: headersToObject(response.headers),
    body,
  };
}

export async function createRequestPayload(
  request: Request<unknown, CfProperties<unknown>>,
) {
  let body: string | undefined;

  // Check if the response has a body and read it
  if (request.body) {
    const reader = request.body.getReader();
    const decoder = new TextDecoder("utf-8");
    body = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      // Decode the value and append it to the body
      // Use the decoder to convert the Uint8Array to a string
      // and append it to the body
      body += decoder.decode(value, { stream: true });
    }
  }

  // Create the payload object
  return {
    method: request.method,
    url: request.url,
    headers: headersToObject(request.headers),
    body,
  };
}
