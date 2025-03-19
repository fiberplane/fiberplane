import { WebSocketServer, WebSocket } from "ws";
import { WebSocketMessageSchema, type WebSocketMessage } from "./types";
import type { ViteDevServer } from "vite";
import {
  subscribeClient,
  unsubscribeClient,
  cleanupClientSubscriptions,
  startWatching,
  getSubscribedClientIds,
} from "./watcher";

let _id = 0;
function generateId(): number {
  _id += 1;
  return _id;
}

// Map of client IDs to their WebSocket connections
const clients = new Map<number, WebSocket>();

// WebSocket server instance
let wss: WebSocketServer | null = null;

// Initialize the messenger module with Vite server and base path
export function initializeMessenger(basePath: string, server: ViteDevServer) {
  console.log(
    "[Messenger] Setting up WebSocket server with basePath:",
    basePath,
  );

  // Create a dedicated WebSocket server
  wss = new WebSocketServer({ noServer: true });
  console.log("[Messenger] WebSocket server created");

  // Handle connection events
  wss.on("connection", (ws) => {
    const id = generateId();
    clients.set(id, ws);
    console.log("[Messenger] Client connected:", id);

    // Handle incoming messages
    ws.on("message", (data) => {
      console.log(
        `[Messenger] Received message from client ${id}:`,
        data.toString().substring(0, 100),
      );

      try {
        const message = JSON.parse(data.toString());
        const result = WebSocketMessageSchema.safeParse(message);

        if (!result.success) {
          console.error(
            "[Messenger] Invalid WebSocket message:",
            result.error.message,
          );
          return;
        }

        switch (result.data.type) {
          case "subscribe": {
            const agentName = result.data.payload.agent;
            console.log(
              `[Messenger] Client ${id} subscribing to agent: ${agentName}`,
            );

            // Use watcher to subscribe client
            const watchPathInfo = subscribeClient(agentName, id);

            // If this is a new subscription, set up watcher
            if (watchPathInfo.ids.length === 1) {
              console.log(
                `[Messenger] Client is first subscriber, ensuring watcher is started for agent: ${agentName}`,
              );
              startWatching(agentName)
                .then((watcherId) => {
                  console.log(
                    `[Messenger] startWatching completed for ${agentName}, watcherId:`,
                    watcherId !== null ? watcherId : "null",
                  );
                })
                .catch((err) => {
                  console.error(
                    `[Messenger] Failed to setup subscription for ${agentName}:`,
                    err,
                  );
                });
            }
            break;
          }
          case "unsubscribe": {
            const agentName = result.data.payload.agent;
            unsubscribeClient(agentName, id);
            break;
          }
        }
      } catch (error) {
        console.error("[Messenger] Error processing WebSocket message:", error);
      }
    });

    // Handle client disconnection
    ws.on("close", () => {
      console.log("[Messenger] Client disconnected:", id);
      clients.delete(id);

      // Clean up subscriptions
      cleanupClientSubscriptions(id);
    });

    // Send a welcome message
    try {
      console.log("[Messenger] Client connected and ready:", id);

      const welcomeMessage: WebSocketMessage = {
        type: "update",
        payload: {
          agent: "system",
        },
      };

      ws.send(JSON.stringify(welcomeMessage));
    } catch (error) {
      console.error("[Messenger] Error in connection setup:", error);
    }
  });

  // Setup WebSocket server
  const httpServer = server.httpServer;
  if (!httpServer) {
    console.error(
      "[Messenger] Cannot setup WebSocket server: Vite HTTP server not available",
    );
    return null;
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
        "[Messenger] Handling WebSocket upgrade for path:",
        url.pathname,
      );
      wss?.handleUpgrade(request, socket, head, (ws) => {
        wss?.emit("connection", ws, request);
      });
    }
    // All other paths are handled by Vite's default handler
  });

  return wss;
}

// Notify clients about agent changes
export function notifyClientsAboutAgentChange(agent: string): void {
  const clientIds = getSubscribedClientIds(agent);

  if (clientIds.length === 0) {
    return;
  }

  console.log(
    `[Messenger] Notifying ${clientIds.length} clients about agent ${agent} changes`,
  );

  const message: WebSocketMessage = {
    type: "agentUpdated",
    payload: {
      agent,
    },
  };

  // Send to all subscribed clients
  for (const clientId of clientIds) {
    const client = clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
}
