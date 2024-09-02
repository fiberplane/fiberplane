/**
 * In Hono-node environments, env vars are not available on the `env` object that's passed to `app.fetch`.
 * This helper will also check process.env and fallback to that if the env var is not present on the `env` object.
 */
export function getFromEnv(honoEnv: unknown, key: string) {
  const env = getNodeSafeEnv(honoEnv);

  return typeof env === "object" && env !== null
    ? (env as Record<string, string | null>)?.[key]
    : null;
}

/**
 * Return `process.env` if we're in Node.js, otherwise `honoEnv`
 *
 * Used to get the env object for accessing and recording env vars.
 * This eixsts because in Node.js, the `env` object passed to `app.fetch` is different from the env object in other runtimes.
 *
 * @param honoEnv - The env object from the `app.fetch` method.
 * @returns - `process.env` if we're in Node.js, otherwise `honoEnv`.
 */
export function getNodeSafeEnv(honoEnv: unknown) {
  const hasProcessEnv = runtimeHasProcessEnv();
  const isRunningInHonoNode = isHonoNodeEnv(honoEnv);
  return hasProcessEnv && isRunningInHonoNode ? process.env : honoEnv;
}

function runtimeHasProcessEnv() {
  if (typeof process !== "undefined" && typeof process.env !== "undefined") {
    return true;
  }
  return false;
}

/**
 * Helper to determine if the env is coming from a Hono node environment.
 *
 * In Node.js, the `env` passed to `app.fetch` is an object with keys "incoming" and "outgoing",
 * one of which has circular references. We don't want to serialize this.
 */
function isHonoNodeEnv(env: unknown) {
  if (typeof env !== "object" || env === null) {
    return false;
  }
  const envKeys = Object.keys(env).map((key) => key.toLowerCase());
  return (
    envKeys.length === 2 &&
    envKeys.includes("incoming") &&
    envKeys.includes("outgoing")
  );
}
