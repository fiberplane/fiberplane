import { createServer } from "node:http";
import { serve } from "@hono/node-server";
import chalk from "chalk";
import { config } from "dotenv";
import figlet from "figlet";
import { type WebSocket, WebSocketServer } from "ws";
import { createApp } from "./app.js";
import logger from "./logger.js";
import { startRouteProbeWatcher } from "./probe-routes.js";
import {
  frontendRoutesHandler,
  staticServerMiddleware,
} from "./serve-frontend-build.js";

config({ path: ".dev.vars" });

const wsConnections = new Set<WebSocket>();

// Set up the api routes
const app = createApp(wsConnections);

/**
 * Serve all the frontend static files
 */
app.use("/*", staticServerMiddleware);

/**
 * Fallback route that just serves the frontend index.html file,
 * This is necessary to support frontend routing!
 */
app.get("*", frontendRoutesHandler);

// Serve the API
const port = +(process.env.FPX_PORT ?? 8788);
const server = serve({
  fetch: app.fetch,
  port,
  createServer,
}) as ReturnType<typeof createServer>;

server.on("listening", () => {
  const fpxLogo = chalk.greenBright(figlet.textSync("FPX Studio"));
  const runningMessage = "FPX Studio is up!";
  const localhostLink = chalk.blue(`http://localhost:${port}`);
  const visitMessage = `Visit ${localhostLink} to get started`;
  logger.info(`${fpxLogo}\n${runningMessage} ${visitMessage}\n`);
});

server.on("error", (err) => {
  if ("code" in err && err.code === "EADDRINUSE") {
    logger.error(
      `Port ${port} is already in use. Please choose a different port for FPX.`,
    );
    process.exit(1);
  } else {
    logger.error("Server error:", err);
  }
});

// First, fire off an async probe to the service we want to monitor
//   - This will collect information on all routes that the service exposes
//   - This powers a postman-like UI to ping routes and see responses
//
// Additionally, this will watch for changes to files in the project directory,
//   - If a file changes, send a new probe to the service
const watchDir = process.env.FPX_WATCH_DIR ?? process.cwd();
startRouteProbeWatcher(watchDir);

// Set up websocket server
const wss = new WebSocketServer({ server, path: "/ws" });
wss.on("connection", (ws) => {
  logger.debug("WebSocket connection established", ws.OPEN);
  wsConnections.add(ws);

  ws.on("ping", () => {
    logger.debug("ping");
    ws.send("pong");
  });
  ws.on("error", (err) => {
    if ("code" in err && err.code === "EADDRINUSE") {
      logger.error(
        "WebSocket error: Address in use. Please choose a different port.",
      );
    } else {
      logger.error("WebSocket error:", err);
    }
  });
  ws.on("close", (code) => {
    wsConnections.delete(ws);
    logger.debug("WebSocket connection closed", code);
  });
});
