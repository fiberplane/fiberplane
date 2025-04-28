import { getAgentByName } from "agents";
import { Hono } from "hono";
import type { StatusCode } from "hono/utils/http-status";
import packageJson from "../package.json" assert { type: "json" };
import { getAgents } from "./agentInstances";
import {
  PARTYKIT_NAMESPACE_HEADER,
  PARTYKIT_ROOM_HEADER,
  getDurableObjectAgentNamespace,
  isDurableObjectNamespace,
  toKebabCase,
} from "./utils";

const version = packageJson.version;
const commitHash = import.meta.env.GIT_COMMIT_HASH ?? "";

function createFpApp(customPath = "/fp") {
  let firstRequest = true;
  const app = new Hono().basePath(customPath);
  const api = new Hono();
  api.get("/agents", async (c) => {
    const agents = getAgents();

    if (firstRequest) {
      firstRequest = false;

      const durableObjects =
        c.env && typeof c.env === "object"
          ? (Object.entries(c.env as Record<string, unknown>).filter(
              ([_, value]) => isDurableObjectNamespace(value),
            ) as Array<[string, DurableObjectNamespace]>)
          : [];
      for (const [name] of durableObjects) {
        // See if we're aware of an agent with the same id
        // However id is the namespace (kebab case of the name)
        const namespace = toKebabCase(name);
        if (!agents.some((agent) => agent.id === namespace)) {
          console.warn(
            `Warning: durable object detected but it is not enhanced with the \`withInstrumentation()\` (binding name: ${name}, expected namespace: ${namespace})`,
          );
        }
      }
    }

    return c.json(agents);
  });

  // Updated route to handle all admin paths with any level of nesting
  api.all("/agents/:namespace/:instance/admin/*", async (c) => {
    const { namespace: rawNamespace, instance } = c.req.param();
    const durableObject = getDurableObjectAgentNamespace(c.env, rawNamespace);

    if (!durableObject) {
      console.warn("Agent not found", rawNamespace);
      return c.json(
        {
          error: `Agent ${rawNamespace} not found`,
        },
        404,
      );
    }

    const doInstance = await getAgentByName(durableObject, instance);

    // Extract the base path and the rest of the URI
    const requestPath = c.req.path;
    const adminPathPrefix = `${customPath}/api/agents/${rawNamespace}/${instance}/admin/`;
    const adminPath = requestPath.startsWith(adminPathPrefix)
      ? requestPath.substring(adminPathPrefix.length - 1) // Keep the leading slash
      : "";

    // Create the internal URL with the properly extracted path
    const internalUrl = new URL(
      `/agents/${rawNamespace}/${instance}/admin${adminPath}`,
      "http://internal",
    );
    // console.log("Internal URL:", internalUrl);
    const headers = new Headers(c.req.header());
    headers.set(PARTYKIT_NAMESPACE_HEADER, rawNamespace);
    headers.set(PARTYKIT_ROOM_HEADER, instance);

    const requestInfo = new Request(internalUrl, {
      method: c.req.method,
      headers,
      body: c.req.raw.body,
    });

    const response = await doInstance.onRequest(requestInfo);

    // Create a new response with the same status and body
    // @ts-ignore
    const newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
    });

    // Copy all headers from the original response
    response.headers.forEach((value, key) => {
      c.header(key, value);
    });

    // Send the new response content back using the methods on the Hono context
    // Convert raw number to StatusCode by explicitly casting it
    c.status(newResponse.status as StatusCode);

    // Handle null body case
    if (newResponse.body === null) {
      return c.body("");
    }

    return c.body(newResponse.body);
  });
  app.route("/api", api);
  // app.route("/api", api)

  app.get("*", async (c) => {
    const options = {
      mountedPath: customPath,
      version,
      commitHash,
    };
    const cdn = `https://cdn.jsdelivr.net/npm/@fiberplane/agents@${
      version ? version : "latest"
    }/dist/playground/`;
    const cssBundleUrl = new URL("index.css", cdn).href;
    const jsBundleUrl = new URL("index.js", cdn).href;
    return c.html(
      <html lang="en">
        <head>
          <title>Agents Playground</title>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="stylesheet" href={cssBundleUrl} />
        </head>
        <body>
          <div id="root" data-options={JSON.stringify(options)} />
          <script type="module" src={jsBundleUrl} />
        </body>
      </html>,
    );
  });

  return app;
}

interface FiberplaneEntryWrapperOptions {
  customPath?: string;
}

/**
 * Creates a fetch handler that serves the Fiberplane app
 */
export function fiberplane<E = unknown>(
  userFetch: (
    request: Request,
    env: E,
    ctx: ExecutionContext,
  ) => Promise<Response>,
  options?: FiberplaneEntryWrapperOptions,
) {
  const fpApp = createFpApp(options?.customPath);

  return async function fetch(request: Request, env: E, ctx: ExecutionContext) {
    const newRequest = new Request(request);
    const response = await fpApp.fetch(newRequest, env, ctx);
    if (response.status !== 404) {
      // If the response is not 404, return it
      return response;
    }

    return userFetch(request, env, ctx);
  };
}
