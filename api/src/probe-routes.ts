import fs from "node:fs";

import { getIgnoredPaths, shouldIgnoreFile } from "./lib/utils.js";

let debounceTimeout: NodeJS.Timeout | null = null;

// biome-ignore lint/suspicious/noExplicitAny: Trust me, this is easier
function debounce<T extends (...args: any[]) => void>(func: T, wait: number) {
  // biome-ignore lint/suspicious/noExplicitAny: Trust me, this is easier
  return (...args: any[]) => {
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    debounceTimeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Since we are calling the route probe inside a file watcher, we should implement
 * debouncing to avoid spamming the service with requests.
 *
 * HACK - Since we are monitoring ts files, we need a short delay to let the code
 *        for the service recompile.
 */
const debouncedProbeRoutesWithExponentialBackoff = debounce(
  probeRoutesWithExponentialBackoff,
  1500,
);

export function startRouteProbeWatcher(watchDir: string) {
  // Fire off an async probe to the service we want to monitor
  // This will collect information on all routes that the service exposes
  // Which powers a postman-like UI to ping routes and see responses
  const serviceTargetArgument = process.env.FPX_SERVICE_TARGET;
  const probeMaxRetries = 10;
  const probeDelay = 1000;

  debouncedProbeRoutesWithExponentialBackoff(
    serviceTargetArgument,
    probeMaxRetries,
    probeDelay,
  );

  const ignoredPaths = getIgnoredPaths();

  fs.watch(watchDir, { recursive: true }, async (eventType, filename) => {
    if (shouldIgnoreFile(filename, ignoredPaths)) {
      return;
    }

    console.debug(`File ${filename} ${eventType}, sending a new probe`);

    debouncedProbeRoutesWithExponentialBackoff(
      serviceTargetArgument,
      probeMaxRetries,
      probeDelay,
    );
  });
}

/**
 * Asynchronously probe the routes of a service with exponential backoff.
 * Makes a request to the service root route with the `X-Fpx-Route-Inspector` header set to `enabled`.
 */
async function probeRoutesWithExponentialBackoff(
  serviceArg: string | number | undefined,
  maxRetries: number,
  delay = 1000,
) {
  const serviceUrl = resolveServiceArg(serviceArg);
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await routerProbe(serviceUrl);
      console.log(`Detected routes for ${serviceUrl} successfully!`);
      return;
    } catch (error) {
      attempt++;
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error(
        `Router probe for service ${serviceUrl} failed (attempt ${attempt}):`,
        errorMessage,
      );
      if (attempt < maxRetries) {
        const backoffDelay = delay * 2 ** attempt;
        console.log(`Retrying in ${backoffDelay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      } else {
        console.log(
          "Router probe max retries reached. Giving up. Restart the service to try again.",
        );
      }
    }
  }
}

async function routerProbe(target: string) {
  const headers = new Headers();
  headers.append("X-Fpx-Route-Inspector", "enabled");
  return await fetch(target, {
    method: "GET",
    headers,
  });
}

/**
 * Helper function for resolving the service to probe, given a string or number argument.
 * See the tests for expected behavior, but here are some examples:
 *
 * - `resolveServiceArg()` => "http://localhost:8787"
 * - `resolveServiceArg(8787)` => "http://localhost:8787"
 * - `resolveServiceArg("8787")` => "http://localhost:8787"
 * - `resolveServiceArg("1234")` => "http://localhost:1234"
 * - `resolveServiceArg("http://localhost:1234")` => "http://localhost:1234"
 * - `resolveServiceArg("invalid", "http://localhost:4321")` => "http://localhost:4321"
 */
export function resolveServiceArg(
  serviceArg: string | number | undefined,
  fallback = "http://localhost:8787",
) {
  if (!serviceArg) {
    return fallback;
  }
  if (typeof serviceArg === "string" && serviceArg.startsWith("http")) {
    return serviceArg;
  }
  if (typeof serviceArg === "number") {
    return `http://localhost:${serviceArg}`;
  }
  const targetPort = Number.parseInt(serviceArg, 10);
  if (!targetPort) {
    console.error(
      `Invalid service argument ${serviceArg}. Using default ${fallback}.`,
    );
    return fallback;
  }
  return `http://localhost:${targetPort}`;
}
