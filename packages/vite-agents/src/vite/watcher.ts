import type { ViteDevServer } from "vite";
import path from "node:path";
import { getSqlitePathForAgent } from "./utils";

type WatchPathInfo = {
  filePath: string;
  fileWatcherId?: number;
  ids: Array<number>;
  notificationTimeout?: NodeJS.Timeout;
};

// Map of agent names to their watch info
const watchPaths: Record<string, WatchPathInfo> = {};

// Reference to the Vite server
let viteServer: ViteDevServer | null = null;

// Type for the callback when files change
type FileChangeCallback = (agent: string) => void;
let onFileChangeCallback: FileChangeCallback | null = null;

// Initialize the watcher module with the Vite server and agent names
export function initializeWatcher(server: ViteDevServer, agentNames: string[]) {
  console.log("[Watcher] Initializing with Vite server");
  viteServer = server;

  // Initialize agent watch paths structure
  initializeAgentWatchPaths(agentNames);

  // Start watching each agent
  for (const agent of agentNames) {
    startWatching(agent)
      .then((watcherId) => {
        console.log(
          `[Watcher] Watcher started for agent ${agent}:`,
          watcherId !== null ? "success" : "failed",
        );
      })
      .catch((err) => {
        console.error(
          `[Watcher] Error starting watcher for agent ${agent}:`,
          err,
        );
      });
  }
}

// Set the callback to be called when files change
export function setFileChangeCallback(callback: FileChangeCallback) {
  onFileChangeCallback = callback;
}

// Function to notify about file changes
function notifyFileChange(agent: string) {
  const watchPathInfo = watchPaths[agent];
  if (!watchPathInfo || watchPathInfo.ids.length === 0) {
    return;
  }

  // Clear any existing timeout to prevent multiple rapid notifications
  if (watchPathInfo.notificationTimeout) {
    clearTimeout(watchPathInfo.notificationTimeout);
  }

  // Set a small debounce delay to prevent too many notifications for rapid changes
  watchPathInfo.notificationTimeout = setTimeout(() => {
    console.log(
      `[Watcher] Change detected for agent ${agent}, notifying messenger`,
    );

    if (onFileChangeCallback) {
      onFileChangeCallback(agent);
    }
  }, 100); // 100ms debounce
}

// Initialize agent watch paths structure (but don't start watching yet)
function initializeAgentWatchPaths(agentNames: string[]) {
  console.log(
    `[Watcher] Initializing watch paths for ${agentNames.length} agents:`,
    agentNames,
  );

  for (const name of agentNames) {
    console.log(`[Watcher] Initializing agent: ${name}`);
    watchPaths[name] = {
      filePath: "",
      ids: [],
    };
  }
}

// Start watching files for a specific agent
export const startWatching = async (agent: string): Promise<number | null> => {
  console.log(`[Watcher] Starting watcher for agent: ${agent}`);

  if (!viteServer) {
    console.error(
      "[Watcher] Cannot start watching - Vite server not initialized",
    );
    return null;
  }

  try {
    if (watchPaths[agent]) {
      console.log(`[Watcher] Using existing watcher for agent: ${agent}`);

      // If there's already a watcher, return its ID
      if (watchPaths[agent].fileWatcherId !== undefined) {
        return watchPaths[agent].fileWatcherId;
      }
    } else {
      // Initialize new entry in watchPaths
      watchPaths[agent] = {
        filePath: "",
        ids: [],
      };
    }

    // Get the SQLite path from utils, which handles the project name and agent name
    const sqlitePath = await getSqlitePathForAgent(agent);
    console.log(
      `[Watcher] getSqlitePathForAgent returned: ${sqlitePath || "undefined"}`,
    );

    if (!sqlitePath) {
      console.error(`[Watcher] No SQLite file found for agent ${agent}`);
      return null;
    }

    // Store the file path
    watchPaths[agent].filePath = sqlitePath;

    // Get the directory to watch
    const sqliteDirPath = path.dirname(sqlitePath);
    console.log(`[Watcher] Setting up watcher for directory: ${sqliteDirPath}`);

    // Use Vite's watcher instead of chokidar
    // Vite's watcher.add returns void, not an ID, so we'll use a random ID for tracking
    const fileWatcherId = Math.floor(Math.random() * 10000);
    viteServer.watcher.add(sqliteDirPath);
    console.log(
      `[Watcher] Added Vite watcher for ${sqliteDirPath} with ID: ${fileWatcherId}`,
    );

    // Store the watcher ID
    watchPaths[agent].fileWatcherId = fileWatcherId;

    // Set up event handler for file changes
    viteServer.watcher.on("change", (filePath) => {
      if (filePath.startsWith(sqliteDirPath) && filePath.endsWith(".sqlite")) {
        console.log(`[Watcher] SQLite file changed: ${filePath}`);
        notifyFileChange(agent);
      }
    });

    viteServer.watcher.on("add", (filePath) => {
      if (filePath.startsWith(sqliteDirPath) && filePath.endsWith(".sqlite")) {
        console.log(`[Watcher] SQLite file added: ${filePath}`);
        watchPaths[agent].filePath = filePath;
        notifyFileChange(agent);
      }
    });

    viteServer.watcher.on("unlink", (filePath) => {
      if (filePath.startsWith(sqliteDirPath) && filePath.endsWith(".sqlite")) {
        console.log(`[Watcher] SQLite file removed: ${filePath}`);
        watchPaths[agent].filePath = "";
      }
    });

    console.log(`[Watcher] Watcher setup complete for agent: ${agent}`);
    return fileWatcherId;
  } catch (error) {
    console.error(
      `[Watcher] Error setting up watcher for agent ${agent}:`,
      error,
    );
    return null;
  }
};

// Stop watching files for a specific agent
export const stopWatching = async (agent: string): Promise<void> => {
  console.log(`[Watcher] Stopping watcher for agent: ${agent}`);

  const watchInfo = watchPaths[agent];
  if (watchInfo?.fileWatcherId !== undefined && viteServer) {
    try {
      viteServer.watcher.unwatch(watchInfo.filePath);
      console.log(`[Watcher] Unwatched path for agent: ${agent}`);
      // Set to undefined instead of using delete
      watchInfo.fileWatcherId = undefined;
    } catch (error) {
      console.error(
        `[Watcher] Error stopping watcher for agent ${agent}:`,
        error,
      );
    }
  }
};

// Subscribe a client to receive notifications for an agent
export function subscribeClient(agentName: string, clientId: number) {
  console.log(
    `[Watcher] Client ${clientId} subscribing to agent: ${agentName}`,
  );

  let watchPathInfo = watchPaths[agentName];

  if (!watchPathInfo) {
    console.log(`[Watcher] Creating new subscription for agent: ${agentName}`);
    watchPathInfo = {
      filePath: "",
      ids: [clientId],
    };
    watchPaths[agentName] = watchPathInfo;
  } else if (!watchPathInfo.ids.includes(clientId)) {
    console.log(
      `[Watcher] Client ${clientId} subscribing to existing agent: ${agentName}`,
    );
    watchPathInfo.ids.push(clientId);
  }

  return watchPathInfo;
}

// Unsubscribe a client from receiving notifications for an agent
export function unsubscribeClient(agentName: string, clientId: number) {
  const watchPathInfo = watchPaths[agentName];
  if (!watchPathInfo) {
    console.error(`[Watcher] No subscription found for agent: ${agentName}`);
    return false;
  }

  console.log(
    `[Watcher] Client ${clientId} unsubscribing from agent: ${agentName}`,
  );
  const prevLength = watchPathInfo.ids.length;
  watchPathInfo.ids = watchPathInfo.ids.filter((id) => id !== clientId);

  if (prevLength > 0 && watchPathInfo.ids.length === 0) {
    console.log(`[Watcher] No more subscribers for agent: ${agentName}`);
  }

  return true;
}

// Clean up client subscriptions when a client disconnects
export function cleanupClientSubscriptions(clientId: number) {
  for (const agent in watchPaths) {
    const watchPathInfo = watchPaths[agent];
    const previousLength = watchPathInfo.ids.length;
    watchPathInfo.ids = watchPathInfo.ids.filter((id) => id !== clientId);

    if (previousLength > 0 && watchPathInfo.ids.length === 0) {
      console.log(`[Watcher] No more subscribers for agent: ${agent}`);
    }
  }
}

// Get the subscribed client IDs for a specific agent
export function getSubscribedClientIds(agentName: string): number[] {
  return watchPaths[agentName]?.ids || [];
}
