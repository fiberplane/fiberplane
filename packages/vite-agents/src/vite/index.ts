import type { FSWatcher, ViteDevServer } from "vite";
import { WebSocketServer, type WebSocket } from "ws";
import { Hono } from "hono";
import { getRequestListener } from "@hono/node-server";
import {
  getDurableObjectsFromConfig,
  readConfigFile,
  getSqlitePathForAgent,
  serializeSQLiteToJSON,
} from "./utils";
import type { IncomingMessage } from "node:http";
import { WebSocketMessageSchema, type WebSocketMessage } from "./types";
import { logger } from "hono/logger";
import type { WSContext } from "hono/ws";
import type * as chokidar from "chokidar";
import * as path from "node:path";

type Options = {
  basePath?: string;
};

let _id = 0;
function generateId(): number {
  _id += 1;
  return _id;
}

export function agentsPlugin(options: Options = {}) {
  const { basePath = "/fp-agents" } = options;

  console.log("[Agents Plugin] Initializing with basePath:", basePath);
  console.log("[Agents Plugin] WebSocket path:", `${basePath}/ws`);

  const router = new Hono().basePath(basePath);
  router.use(logger());

  router.get("/api/agents", (c) => {
    const result = getDurableObjectsFromConfig();

    if (result.success === false) {
      return c.json(result, 500);
    }

    return c.json(result, 200);
  });

  router.get("/api/agents/:id/db", async (c) => {
    const id = c.req.param("id");
    const filePath = await getSqlitePathForAgent(id);
    if (filePath === undefined) {
      return c.json({ error: "No database found" }, 404);
    }

    const result = await serializeSQLiteToJSON(filePath);
    return c.json(result, 200);
  });

  // Create a dedicated WebSocket server
  const wss = new WebSocketServer({ noServer: true });

  // Map of client IDs to their WebSocket connections
  const clients = new Map<number, WebSocket>();

  // Handle connection events
  wss.on("connection", (ws, request) => {
    const id = generateId();
    clients.set(id, ws);
    console.log("[Agents Plugin] Client connected:", id);

    // Handle incoming messages
    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        const result = WebSocketMessageSchema.safeParse(message);

        if (!result.success) {
          console.error(
            "[Agents Plugin] Invalid WebSocket message:",
            result.error.message,
          );
          return;
        }

        switch (result.data.type) {
          case "subscribe": {
            const agentName = result.data.payload.agent;
            let watchPathInfo = watchPaths[agentName];

            if (!watchPathInfo) {
              console.log(
                `[Agents Plugin] Creating subscription for agent: ${agentName}`,
              );
              watchPathInfo = {
                filePath: "",
                watcher: null,
                ids: [id],
              };
              watchPaths[agentName] = watchPathInfo;

              startWatching(agentName).catch((err) => {
                console.error(
                  `[Agents Plugin] Failed to setup subscription for ${agentName}:`,
                  err,
                );
              });
            } else if (!watchPathInfo.ids.includes(id)) {
              console.log(
                `[Agents Plugin] Client ${id} subscribing to agent: ${agentName}`,
              );
              watchPathInfo.ids.push(id);
            }
            break;
          }
          case "unsubscribe": {
            const agentName = result.data.payload.agent;
            const watchPathInfo = watchPaths[agentName];
            if (!watchPathInfo) {
              console.error(
                `[Agents Plugin] No subscription found for agent: ${agentName}`,
              );
              return;
            }

            console.log(
              `[Agents Plugin] Client ${id} unsubscribing from agent: ${agentName}`,
            );
            watchPathInfo.ids = watchPathInfo.ids.filter(
              (clientId) => clientId !== id,
            );

            if (watchPathInfo.ids.length === 0) {
              console.log(
                `[Agents Plugin] No more subscribers for agent: ${agentName}`,
              );
            }
            break;
          }
        }
      } catch (error) {
        console.error(
          "[Agents Plugin] Error processing WebSocket message:",
          error,
        );
      }
    });

    // Handle client disconnection
    ws.on("close", () => {
      console.log("[Agents Plugin] Client disconnected:", id);
      clients.delete(id);

      // Clean up subscriptions
      for (const agent in watchPaths) {
        const watchPathInfo = watchPaths[agent];
        const previousLength = watchPathInfo.ids.length;
        watchPathInfo.ids = watchPathInfo.ids.filter(
          (clientId) => clientId !== id,
        );

        if (previousLength > 0 && watchPathInfo.ids.length === 0) {
          console.log(
            `[Agents Plugin] No more subscribers for agent: ${agent}`,
          );
        }
      }
    });

    // Send a welcome message
    try {
      ws.send(
        JSON.stringify({
          type: "welcome",
          message: "Connected to Agents WebSocket Server",
        }),
      );
    } catch (error) {
      console.error("[Agents Plugin] Error sending welcome message:", error);
    }
  });

  type WatchPathInfo = {
    filePath: string;
    watcher: chokidar.FSWatcher | null;
    ids: Array<number>;
    notificationTimeout?: NodeJS.Timeout;
  };

  const watchPaths: Record<string, WatchPathInfo> = {};

  let viteServer: ViteDevServer | null = null;

  const startWatching = async (
    agent: string,
  ): Promise<chokidar.FSWatcher | null> => {
    console.log(`[FileWatcher] Starting watcher for agent: ${agent}`);

    if (watchPaths[agent]) {
      console.log(
        `[FileWatcher DISABLED] Using existing subscription structure for agent: ${agent}`,
      );
    } else {
      console.log(
        `[FileWatcher DISABLED] Creating subscription structure for agent: ${agent}`,
      );
      watchPaths[agent] = {
        filePath: "",
        watcher: null,
        ids: [],
      };
    }

    return null;
  };

  const stopWatching = async (agent: string): Promise<void> => {
    console.log(
      `[FileWatcher DISABLED] Would stop watcher for agent: ${agent}`,
    );
  };

  return {
    name: "vite-plugin-agents",
    configureServer(server: ViteDevServer) {
      console.log("[Agents Plugin] Configuring server");
      viteServer = server;

      // Register HTTP handlers
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith(basePath)) {
          return next();
        }
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

      console.log(
        `[Agents Plugin] Setting up structures for ${result.durableObjects.bindings.length} agents`,
      );
      for (const binding of result.durableObjects.bindings) {
        console.log(`[Agents Plugin] Initializing agent: ${binding.name}`);
        watchPaths[binding.name] = {
          filePath: "",
          watcher: null,
          ids: [],
        };
      }

      // Setup WebSocket server
      const httpServer = server.httpServer;
      if (!httpServer) {
        console.error(
          "[Agents Plugin] Cannot setup WebSocket server: Vite HTTP server not available",
        );
        return;
      }

      // Custom WebSocket upgrade handler
      httpServer.on("upgrade", (request, socket, head) => {
        const url = new URL(
          request.url || "/",
          `http://${request.headers.host || "localhost"}`,
        );

        // Only handle our specific path
        if (url.pathname === `${basePath}/ws`) {
          console.log(
            "[Agents Plugin] Handling WebSocket upgrade for our path:",
            url.pathname,
          );
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit("connection", ws, request);
          });
        }
        // All other paths are handled by Vite's default handler
      });
    },
  };
}

export default agentsPlugin;
