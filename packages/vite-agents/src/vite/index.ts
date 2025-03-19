import { getRequestListener } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import type { ViteDevServer } from "vite";
import {
  getDurableObjectsFromConfig,
  getSqlitePathForAgent,
  serializeSQLiteToJSON,
} from "./utils";
import type { DurableObjectsSuccess, ListAgentsResponse } from "./types";

type Options = {
  basePath?: string;
};

export function agentsPlugin(options: Options = {}) {
  const { basePath = "/fp-agents" } = options;

  // Map to store namespace data including instances and agent details
  const namespaceMap = new Map<
    string,
    {
      instances: Set<string>;
      className: string;
      scriptName: string | null;
    }
  >();

  console.log("[Agents Plugin] Initializing with basePath:", basePath);

  const router = new Hono().basePath(basePath);
  router.use(logger());

  router.get("/api/agents", (c) => {
    // Build response from in-memory data instead of re-reading config
    const agentsResponse: ListAgentsResponse = [];

    for (const [name, data] of namespaceMap) {
      agentsResponse.push({
        id: name,
        instances: Array.from(data.instances),
      });
    }

    console.log(
      `[Agents Plugin] GET /api/agents response: ${agentsResponse.length} agents found`,
    );

    return c.json(agentsResponse, 200);
  });

  router.get("/api/agents/:namespace/instances", async (c) => {
    const namespace = c.req.param("namespace").toLowerCase();
    console.log(
      `[Agents Plugin] GET /api/agents/${namespace}/instances requested`,
    );

    // Return the stored instances for the namespace
    const data = namespaceMap.get(namespace);
    const instances = data ? Array.from(data.instances) : [];

    return c.json(
      {
        namespace,
        instances,
      },
      200,
    );
  });

  router.get("/api/agents/:id/db", async (c) => {
    const id = c.req.param("id").toLowerCase();
    console.log(`[Agents Plugin] GET /api/agents/${id}/db requested`);

    const filePath = await getSqlitePathForAgent(id);
    console.log(
      `[Agents Plugin] SQLite path for agent ${id}:`,
      filePath || "not found",
    );

    if (filePath === undefined) {
      return c.json({ error: "No database found" }, 404);
    }

    const result = await serializeSQLiteToJSON(filePath);
    return c.json(result, 200);
  });

  // Load durable objects config
  function loadDurableObjectsConfig() {
    const result = getDurableObjectsFromConfig();
    if (!result.success) {
      console.error(
        "[Agents Plugin] Error getting Durable Objects:",
        result.error,
      );
      return;
    }

    // Populate the namespaceMap with data from config
    for (const binding of result.durableObjects.bindings) {
      const name = binding.name.toLowerCase();
      namespaceMap.set(name, {
        instances: new Set(),
        className: binding.className,
        scriptName: binding.scriptName,
      });
    }

    console.log(
      `[Agents Plugin] Loaded ${namespaceMap.size} agent namespaces from config`,
    );
  }

  return {
    name: "vite-plugin-agents",

    configureServer(server: ViteDevServer) {
      console.log("[Agents Plugin] Configuring server");

      // Load durable objects config once at startup
      loadDurableObjectsConfig();

      // Intercept agent requests and track instances
      server.middlewares.use((req, res, next) => {
        // Check if this is an agent request with the pattern /agents/<namespace>/<instance>
        const agentPattern = /^\/agents\/([^/]+)\/([^/]+)/;
        const match = req.url?.match(agentPattern);

        if (match) {
          const namespace = match[1].toLowerCase();
          const instance = match[2].toLowerCase();

          console.log(
            `[Agents Plugin] Detected agent request: namespace=${namespace}, instance=${instance}`,
          );

          // Store the instance for this namespace
          if (!namespaceMap.has(namespace)) {
            // Create an entry if namespace wasn't in the config
            namespaceMap.set(namespace, {
              instances: new Set(),
              className: "", // Unknown since not in config
              scriptName: null,
            });
          }

          // Add the instance
          namespaceMap.get(namespace)?.instances.add(instance);
        }

        // Regular middleware handling
        if (!req.url?.startsWith(basePath)) {
          return next();
        }
        console.log(
          `[Agents Plugin] Handling request: ${req.method} ${req.url}`,
        );
        const requestListener = getRequestListener(router.fetch);
        requestListener(req, res);
      });

      // Log agent names
      const agentNames = Array.from(namespaceMap.keys());
      console.log(
        `[Agents Plugin] Ready with ${agentNames.length} agents: ${agentNames.join(", ")}`,
      );
    },
  };
}

export default agentsPlugin;
