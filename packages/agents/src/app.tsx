import { Hono } from "hono";
import packageJson from "../package.json" assert { type: "json" };
import { getAgents } from "./agentInstances";
import { isDurableObjectNamespace, toKebabCase, tryCatch } from "./utils";

const version = packageJson.version;
const commitHash = import.meta.env.GIT_COMMIT_HASH;

/**
 * Creates the main Fiberplane app router
 */
export function createFpApp(customPath = "/fp") {
  let firstRequest = true;
  return new Hono()
    .basePath(customPath)
    .get("/api/agents", async (c) => {
      const agents = getAgents();

      if (firstRequest) {
        firstRequest = false;

        const durableObjects =
          c.env && typeof c.env === "object"
            ? (Object.entries(c.env as Record<string, unknown>).filter(
                ([key, value]) => isDurableObjectNamespace(value),
              ) as Array<[string, DurableObjectNamespace]>)
            : [];
        for (const [name] of durableObjects) {
          // See if we're aware of an agent with the same id
          // However id is the namespace (kebab case of the name)
          const namespace = toKebabCase(name);
          if (!agents.some((agent) => agent.id === namespace)) {
            console.warn(
              `Warning: durable object detected but it is not decorated with the \`@Observed()\` decorator (binding name: ${name}, expected namespace: ${namespace})`,
            );
          }
        }
      }

      return c.json(agents);
    })
    .get("*", async (c) => {
      const options = {
        mountedPath: customPath,
        version,
        commitHash,
      };
      const cdn = `https://cdn.jsdelivr.net/npm/@fiberplane/agents@${version ? version : "latest"}/dist/playground/`;
      const cssBundleUrl = new URL("index.css", cdn).href;
      const jsBundleUrl = new URL("index.js", cdn).href;
      return c.html(
        <html lang="en">
          <head>
            <title>Agents Playground</title>
            <meta charSet="utf-8" />
            <meta
              name="viewport"
              content="width=device-width, initial-scale=1"
            />
            <link rel="stylesheet" href={cssBundleUrl} />
          </head>
          <body>
            <div id="root" data-options={JSON.stringify(options)} />
            <script type="module" src={jsBundleUrl} />
          </body>
        </html>,
      );
    })
    .notFound(() => {
      return new Response(null, { status: 404 });
    });
}

// Change from a strict Record<string, string> to a more flexible type
// that allows for any values in the environment object
type Env = Record<string, unknown>;

interface FiberplaneEntryWrapperOptions {
  customPath?: string;
}

/**
 * Creates a fetch handler that serves the Fiberplane app
 */
export function fiberplane<E extends Env>(
  userFetch: (
    request: Request,
    env: E,
    ctx: ExecutionContext,
  ) => Promise<Response>,
  options?: FiberplaneEntryWrapperOptions,
) {
  const fpApp = createFpApp(options?.customPath);

  return async function fetch(request: Request, env: E, ctx: ExecutionContext) {
    const { data: response, error } = await tryCatch(
      fpApp.fetch(request, env, ctx),
    );

    if (!error && response.status !== 404) {
      return response;
    }

    return userFetch(request, env, ctx);
  };
}
