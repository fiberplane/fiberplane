import { getRequestListener } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import type { ViteDevServer } from "vite";
import type { DurableObjectsSuccess, ListAgentsResponse } from "./types";
import { getDurableObjectsFromConfig } from "./utils";
import fs from "node:fs";
import path from "node:path";

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

  // Serve files from dist/playground directory
  router.get("/", async (c) => {
    // Get current working directory and list key directories
    const cwd = process.cwd();
    let output = `Agents Plugin Directory Structure (CWD: ${cwd})\n\n`;
    
    // List directories in current working directory
    try {
      const rootFiles = fs.readdirSync(cwd);
      output += `== Root Directory (${cwd}) ==\n`;
      for (const file of rootFiles) {
        try {
          const stats = fs.statSync(path.join(cwd, file));
          output += `${stats.isDirectory() ? '[DIR] ' : '[FILE]'} ${file}\n`;
        } catch (err: unknown) {
          if (err instanceof Error) {
            output += `[ERROR] ${file} (${err.message})\n`;
          } else {
            output += `[ERROR] ${file} (Unknown error)\n`;
          }
        }
      }
      
      // Check 'dist' directory if it exists
      const distPath = path.join(cwd, 'dist');
      if (fs.existsSync(distPath)) {
        output += `\n== Dist Directory (${distPath}) ==\n`;
        const distFiles = fs.readdirSync(distPath);
        for (const file of distFiles) {
          try {
            const stats = fs.statSync(path.join(distPath, file));
            output += `${stats.isDirectory() ? '[DIR] ' : '[FILE]'} ${file}\n`;
          } catch (err: unknown) {
            if (err instanceof Error) {
              output += `[ERROR] ${file} (${err.message})\n`;
            } else {
              output += `[ERROR] ${file} (Unknown error)\n`;
            }
          }
        }
        
        // Check 'dist/playground' if it exists
        const playgroundPath = path.join(distPath, 'playground');
        if (fs.existsSync(playgroundPath)) {
          output += `\n== Playground Directory (${playgroundPath}) ==\n`;
          const playgroundFiles = fs.readdirSync(playgroundPath);
          for (const file of playgroundFiles) {
            try {
              const stats = fs.statSync(path.join(playgroundPath, file));
              output += `${stats.isDirectory() ? '[DIR] ' : '[FILE]'} ${file}\n`;
            } catch (err: unknown) {
              if (err instanceof Error) {
                output += `[ERROR] ${file} (${err.message})\n`;
              } else {
                output += `[ERROR] ${file} (Unknown error)\n`;
              }
            }
          }
        }
      }
      
      // Check for 'src' directory
      const srcPath = path.join(cwd, 'src');
      if (fs.existsSync(srcPath)) {
        output += `\n== Src Directory (${srcPath}) ==\n`;
        const srcFiles = fs.readdirSync(srcPath);
        for (const file of srcFiles) {
          try {
            const stats = fs.statSync(path.join(srcPath, file));
            output += `${stats.isDirectory() ? '[DIR] ' : '[FILE]'} ${file}\n`;
          } catch (err: unknown) {
            if (err instanceof Error) {
              output += `[ERROR] ${file} (${err.message})\n`;
            } else {
              output += `[ERROR] ${file} (Unknown error)\n`;
            }
          }
        }
      }
      
      // Check for 'public' directory
      const publicPath = path.join(cwd, 'public');
      if (fs.existsSync(publicPath)) {
        output += `\n== Public Directory (${publicPath}) ==\n`;
        const publicFiles = fs.readdirSync(publicPath);
        for (const file of publicFiles) {
          try {
            const stats = fs.statSync(path.join(publicPath, file));
            output += `${stats.isDirectory() ? '[DIR] ' : '[FILE]'} ${file}\n`;
          } catch (err: unknown) {
            if (err instanceof Error) {
              output += `[ERROR] ${file} (${err.message})\n`;
            } else {
              output += `[ERROR] ${file} (Unknown error)\n`;
            }
          }
        }
      }
      
    } catch (error: unknown) {
      if (error instanceof Error) {
        output += `Error scanning directories: ${error.message}\n`;
      } else {
        output += 'Error scanning directories: Unknown error\n';
      }
    }
    
    return c.text(output);
  });

  router.get("/api/agents", (c) => {
    // Build response from in-memory data instead of re-reading config
    const agentsResponse: ListAgentsResponse = [];

    for (const [name, data] of namespaceMap) {
      agentsResponse.push({
        id: name,
        className: data.className,
        scriptName: data.scriptName,
        instances: Array.from(data.instances),
      });
    }

    console.log(
      `[Agents Plugin] GET /api/agents response: ${agentsResponse.length} agents found`,
    );

    return c.json(agentsResponse, 200);
  });

  // router.get("/api/agents/:namespace/instances", async (c) => {
  //   const namespace = c.req.param("namespace").toLowerCase();
  //   console.log(
  //     `[Agents Plugin] GET /api/agents/${namespace}/instances requested`,
  //   );

  //   // Return the stored instances for the namespace
  //   const data = namespaceMap.get(namespace);
  //   const instances = data ? Array.from(data.instances) : [];

  //   return c.json(
  //     {
  //       namespace,
  //       instances,
  //     },
  //     200,
  //   );
  // });

  // router.get("/api/agents/:id/db", async (c) => {
  //   const id = c.req.param("id").toLowerCase();
  //   console.log(`[Agents Plugin] GET /api/agents/${id}/db requested`);

  //   const filePath = await getSqlitePathForAgent(id);
  //   console.log(
  //     `[Agents Plugin] SQLite path for agent ${id}:`,
  //     filePath || "not found",
  //   );

  //   if (filePath === undefined) {
  //     return c.json({ error: "No database found" }, 404);
  //   }

  //   const result = await serializeSQLiteToJSON(filePath);
  //   return c.json(result, 200);
  // });

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

      // Serve playground files
      server.middlewares.use((req, res, next) => {
        if (req.url === "/") {
          // Let Vite handle the request
          return next();
        }
        return next();
      });

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
