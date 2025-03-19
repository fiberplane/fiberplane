import { getRequestListener } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import type { ViteDevServer } from "vite";
import {
  getDurableObjectsFromConfig,
  getSqlitePathForAgent,
  serializeSQLiteToJSON,
} from "./utils";

type Options = {
  basePath?: string;
};

export function agentsPlugin(options: Options = {}) {
  const { basePath = "/fp-agents" } = options;

  console.log("[Agents Plugin] Initializing with basePath:", basePath);

  const router = new Hono().basePath(basePath);
  router.use(logger());

  router.get("/api/agents", (c) => {
    const result = getDurableObjectsFromConfig();
    console.log(
      "[Agents Plugin] GET /api/agents response:",
      result.success
        ? `${result.durableObjects.bindings.length} agents found`
        : `Error: ${result.error}`,
    );

    if (result.success === false) {
      return c.json(result, 500);
    }

    return c.json(result, 200);
  });

  router.get("/api/agents/:id/db", async (c) => {
    const id = c.req.param("id");
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

  return {
    name: "vite-plugin-agents",

    configureServer(server: ViteDevServer) {
      console.log("[Agents Plugin] Configuring server");

      // Register HTTP handlers
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith(basePath)) {
          return next();
        }
        console.log(
          `[Agents Plugin] Handling request: ${req.method} ${req.url}`,
        );
        const requestListener = getRequestListener(router.fetch);
        requestListener(req, res);
      });

      // Setup agent data
      const result = getDurableObjectsFromConfig();
      if (!result.success) {
        console.error(
          "[Agents Plugin] Error getting Durable Objects:",
          result.error,
        );
        return;
      }

      // Log agent names
      const agentNames = result.durableObjects.bindings.map(
        (binding) => binding.name,
      );
      console.log(
        `[Agents Plugin] Found ${agentNames.length} agents: ${agentNames.join(", ")}`,
      );
    },
  };
}

export default agentsPlugin;
