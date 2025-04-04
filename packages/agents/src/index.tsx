import type {
  Tool,
  Resource,
  MCPPrompt,
} from "@modelcontextprotocol/sdk/types.js";
import type { Agent, Connection, ConnectionContext, WSMessage } from "agents";
import { MCPClientManager, type getNamespacedData } from "agents/mcp/client";
import { Hono } from "hono";
import { type SSEStreamingApi, streamSSE } from "hono/streaming";
import packageJson from "../package.json" assert { type: "json" };
import {
  getAgents,
  registerAgent,
  registerAgentInstance,
} from "./agentInstances";
import type { AgentEvent } from "./types";
import {
  createRequestPayload,
  createResponsePayload,
  isDurableObjectNamespace,
  isPromiseLike,
  toKebabCase,
  tryCatch,
  tryCatchAsync
} from "./utils";

const PARTYKIT_NAMESPACE_HEADER = "x-partykit-namespace";
const PARTYKIT_ROOM_HEADER = "x-partykit-room";

// Define types for database schema
type ColumnType = "string" | "number" | "boolean" | "null" | "object" | "array";
type TableSchema = {
  columns: Record<string, ColumnType[]>;
  data: Record<string, unknown>[];
  error?: string;
};
type DatabaseResult = Record<string, TableSchema>;
type AgentConstructor<E = unknown, S = unknown> = new (
  // biome-ignore lint/suspicious/noExplicitAny: mixin pattern requires any[]
  ...args: any[]
) => Agent<E, S>;

const version = packageJson.version;
const commitHash = import.meta.env.GIT_COMMIT_HASH;

function createAgentAdminRouter(agent: ObservedAgent) {
  const router = new Hono();

  router.get("/agents/:namespace/:instance/admin/db", async (c) => {
    const fetchDbResult = async () => {
      // Get all table names
      const tablesQuery =
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'";
      const tablesResult = tryCatch(() =>
        agent.sql(Object.assign([tablesQuery], { raw: [tablesQuery] })),
      );

      if (tablesResult.error) {
        return { error: "Failed to retrieve tables" };
      }

      // Convert result set to array of table names
      const tableNames = Array.from(tablesResult.data)
        .map((row) => String(row.name || ""))
        .filter((name) => name && name !== "_cf_METADATA");

      // Process each table and collect results
      const tableResultsPromises = tableNames.map(async (tableName) => {
        // Get column information
        const pragmaQuery = `PRAGMA table_info("${tableName}")`;
        const columnInfoResult = tryCatch(() =>
          agent.sql(Object.assign([pragmaQuery], { raw: [pragmaQuery] })),
        );

        if (columnInfoResult.error) {
          return [
            tableName,
            {
              columns: {},
              data: [],
              error: `Error retrieving column info: ${columnInfoResult.error.message}`,
            },
          ];
        }

        // Process column information
        const columnData = Array.from(columnInfoResult.data)
          .filter((column) => column.name)
          .map((column) => {
            const colName = String(column.name);
            const types: ColumnType[] = [];

            if (column.notnull === 0) {
              types.push("null");
            }

            // Map SQL types to ColumnTypes
            const colType = String(column.type || "");
            switch (colType.toUpperCase()) {
              case "TEXT":
                types.push("string");
                break;
              case "INTEGER":
                types.push("number");
                break;
              case "REAL":
                types.push("number");
                break;
              case "BOOLEAN":
                types.push("boolean");
                break;
              case "BLOB":
                types.push("object");
                break;
              default:
                types.push("string");
            }

            return [colName, types];
          });

        // Create columns object and extract column names
        const columns = Object.fromEntries(columnData);
        const columnNames = Object.keys(columns);

        if (columnNames.length === 0) {
          return [
            tableName,
            {
              columns: {},
              data: [],
              error: "No columns found",
            },
          ];
        }

        // Get row data
        const selectQuery = `SELECT * FROM "${tableName}"`;
        const rowsResult = tryCatch(() =>
          agent.sql(Object.assign([selectQuery], { raw: [selectQuery] })),
        );

        if (rowsResult.error) {
          return [
            tableName,
            {
              columns,
              data: [],
              error: `Error retrieving data: ${rowsResult.error.message}`,
            },
          ];
        }

        // Process row data
        const data = [];
        // We still need to use for-await here since we're dealing with an async iterator
        for await (const row of rowsResult.data) {
          // Create a new row object by mapping column names to values
          const typedRow = columnNames.reduce(
            (acc, colName) => {
              acc[colName] = row[colName as keyof typeof row];
              return acc;
            },
            {} as Record<string, unknown>,
          );

          data.push(typedRow);
        }

        return [tableName, { columns, data }];
      });

      // Collect all table results and convert to object
      const tableResults = await Promise.all(tableResultsPromises);
      return Object.fromEntries(tableResults) as DatabaseResult;
    };

    const result = await tryCatchAsync(fetchDbResult());

    if (result.error) {
      console.error("Error retrieving database:", result.error);
      return c.json({ error: "Failed to retrieve database" }, 500);
    }

    return c.json(result.data);
  });

  router.get("/agents/:namespace/:instance/admin/mcp", async (c) => {
    interface ServerData {
      tools: Tool[];
      resources: Resource[];
      prompts: MCPPrompt[];
    }

    if (agent._mcpManagers && agent._mcpManagers?.size > 0) {
      const { data, error } = tryCatch(() => {
        const allTools =
          agent._mcpManagers
            ?.values()
            .flatMap((mcpManager) => mcpManager.listTools()) || [];
        const allResources =
          agent._mcpManagers
            ?.values()
            .flatMap((mcpManager) => mcpManager.listResources()) || [];
        const allPrompts =
          agent._mcpManagers
            ?.values()
            .flatMap((mcpManager) => mcpManager.listPrompts()) ||
          ([] as MCPPrompt[]);

        const serverMap = new Map<string, ServerData>();

        const getOrCreateServer = (serverName: string): ServerData => {
          let server = serverMap.get(serverName);
          if (!server) {
            server = {
              tools: [],
              resources: [],
              prompts: [],
            };
            serverMap.set(serverName, server);
          }
          return server;
        };

        for (const tool of allTools) {
          const server = getOrCreateServer(tool.serverName);
          server.tools.push(tool);
        }

        for (const resource of allResources) {
          const server = getOrCreateServer(resource.serverName);
          server.resources.push(resource);
        }

        for (const prompt of allPrompts) {
          // @ts-expect-error something is borked with types
          const server = getOrCreateServer(prompt.serverName);
          // @ts-expect-error something is borked with types
          server.prompts.push(prompt);
        }

        return Array.from(serverMap.values());
      });

      if (error) {
        console.error("Error retrieving MCP data:", error);
        return c.json({ error: "Failed to retrieve MCP data" }, 500);
      }

      return c.json({ data });
    }
    return c.json({ data: [] });
  });

  router.get("/agents/:namespace/:instance/admin/events", async (c) => {
    if (!agent._activeStreams) {
      agent._activeStreams = new Set();
    }
    return streamSSE(
      c,
      async (stream) => {
        agent._activeStreams.add(stream);

        await stream.writeSSE({
          event: "stream_open",
          data: "",
        });

        // Keep the connection open with a heartbeat
        let heartbeatCount = 0;
        while (!stream.closed && !stream.aborted) {
          // Send a heartbeat every 30 seconds to keep the connection alive
          await stream.sleep(30000);
          await stream.writeSSE({
            event: "heartbeat",
            data: String(heartbeatCount++),
          });
        }
      },
      async (streamError, stream) => {
        console.error("Error in stream:", streamError);
        stream.writeSSE({
          event: "stream_error",
          data: streamError.message,
        });
        agent._activeStreams.delete(stream);
      },
    );
  });

  return router;
}

interface ObservedProperties {
  _activeStreams: Set<SSEStreamingApi>;
  _mcpManagers?: Set<MCPClientManager>;
  _fiberRouter?: Hono;
}

function isMCPClientManagerLike(value: object): value is MCPClientManager {
  return value instanceof MCPClientManager;
}

/**
 * Detects properties that are MCPClientManager instances
 * @returns A map of property names to MCPClientManager instances
 */
function detectMCPClientManagers(obj: Record<string, unknown>) {
  const managers = new Set<MCPClientManager>();

  // Iterate through all properties of the object
  for (const [key, value] of Object.entries(obj)) {
    // Skip null or non-object values
    if (!value || typeof value !== "object") {
      continue;
    }

    // Use instanceof to check if it's an MCPClientManager object
    if (isMCPClientManagerLike(value)) {
      managers.add(value);
      console.log(
        `Found MCPClientManager at property '${key}' - will discover MCP servers, tools, resources and prompts`,
      );
    }
  }

  return managers;
}

type ObservedAgent = Agent<unknown, unknown> & ObservedProperties;

/**
 * Class decorator factory that adds Fiber capabilities to Agent classes
 *
 * Usage:
 * ```typescript
 *
 * @Observed()
 * export class MyAgent extends Agent {
 *   // Your agent implementation
 * }
 * ```
 */
export function Observed<E = unknown, S = unknown>() {
  return <T extends AgentConstructor<E, S>>(BaseClass: T) => {
    return class extends BaseClass {
      _fiberRouter?: Hono;
      _activeStreams = new Set<SSEStreamingApi>();
      _mcpManagers?: Set<MCPClientManager>;
      // biome-ignore lint/suspicious/noExplicitAny: mixin pattern requires any[]
      constructor(...args: any[]) {
        super(...args);
        const superClassName = Object.getPrototypeOf(this.constructor).name;
        registerAgent(superClassName);

        // Detect MCPClientManager instances
        // We need to cast this to Record<string, unknown> for the detection function
        // This is safe because we're only accessing properties dynamically
        this._mcpManagers = detectMCPClientManagers(
          // FIXME: come back to this
          this as Record<string, unknown>,
        );
      }

      private recordEvent({ event, payload }: AgentEvent) {
        for (const stream of this._activeStreams) {
          stream.writeSSE({
            event,
            data: JSON.stringify(payload),
          });
        }
      }

      onStateUpdate(state: unknown, source: Connection | "server"): void {
        this.recordEvent({
          event: "state_change",
          payload: {
            state,
            source,
          },
        });

        super.onStateUpdate(state as S, source);
      }

      override broadcast(
        msg: string | ArrayBuffer | ArrayBufferView,
        without?: string[] | undefined,
      ): void {
        this.recordEvent({
          event: "broadcast",
          payload: {
            message:
              typeof msg === "string"
                ? msg
                : {
                    type: "binary",
                    size: msg instanceof Blob ? msg.size : msg.byteLength,
                  },
            without,
          },
        });

        super.broadcast(msg, without);
      }

      // Create a proxy for a WebSocket-like object to intercept send calls
      private createWebSocketProxy(connection: Connection): Connection {
        const self = this;
        return new Proxy(connection, {
          get(target, prop, receiver) {
            // Intercept the 'send' method
            if (prop === "send") {
              return function (
                this: Connection,
                message: string | ArrayBuffer | ArrayBufferView,
              ) {
                self.recordEvent({
                  event: "ws_send",
                  payload: {
                    connection: {
                      id: target.id,
                    },
                    message:
                      typeof message === "string"
                        ? message
                        : {
                            type: "binary",
                            size:
                              message instanceof Blob
                                ? message.size
                                : message.byteLength,
                          },
                  },
                });

                // Call the original send method
                return Reflect.get(target, prop, receiver).call(this, message);
              };
            }

            // Return other properties/methods unchanged
            return Reflect.get(target, prop, receiver);
          },
        });
      }

      onMessage(connection: Connection, message: WSMessage) {
        this.recordEvent({
          event: "ws_message",
          payload: {
            connection: {
              id: connection.id,
            },
            message,
          },
        });

        const connectionProxy = this.createWebSocketProxy(connection);

        // Use the original connection for the parent class
        return super.onMessage(connectionProxy, message);
      }

      onConnect(connection: Connection, ctx: ConnectionContext) {
        this.recordEvent({
          event: "ws_open",
          payload: {
            connection,
            ctx,
          },
        });

        // Create a proxied connection to intercept send calls
        const proxiedConnection = this.createWebSocketProxy(connection);

        // Use the proxied connection for the parent class
        return super.onConnect(proxiedConnection, ctx);
      }

      onClose(
        connection: Connection,
        code: number,
        reason: string,
        wasClean: boolean,
      ): void | Promise<void> {
        this.recordEvent({
          event: "ws_close",
          payload: { connection, code, reason, wasClean },
        });

        return super.onClose(connection, code, reason, wasClean);
      }

      onRequest(request: Request): Response | Promise<Response> {
        const namespace = request.headers.get(PARTYKIT_NAMESPACE_HEADER);
        const instance = request.headers.get(PARTYKIT_ROOM_HEADER);

        if (namespace && instance) {
          registerAgentInstance(namespace, instance);
        } else {
          console.error(
            "Missing namespace or instance headers in request",
            request,
          );
        }

        if (!this._fiberRouter) {
          this._fiberRouter = createAgentAdminRouter(
            this as unknown as ObservedAgent,
          );
        }

        this._fiberRouter.notFound(() => {
          // Extract url & method for re-use in the response payload
          const { url, method } = request;

          // Create a promise chain to ensure the event is recorded
          // since we may need to read the body of the request
          const eventPromise = Promise.resolve().then(async () => {
            this.recordEvent({
              event: "http_request",
              // Clone the request to avoid consuming the body
              payload: await createRequestPayload(
                request.clone() as typeof request,
              ),
            });
          });
          const result = super.onRequest(request);

          // eventPromise.then()
          if (isPromiseLike(result)) {
            return Promise.all([result, eventPromise]).then(async ([res]) => {
              const payload = await createResponsePayload(res.clone());
              this.recordEvent({
                event: "http_response",
                payload: {
                  ...payload,
                  url,
                  method,
                },
              });

              return res;
            });
          }

          const capturedResponse = result.clone();
          eventPromise.then(async () => {
            const payload = await createResponsePayload(capturedResponse);

            this.recordEvent({
              event: "http_response",
              payload: {
                ...payload,
                url,
                method,
              },
            });
          });

          return result;
        });
        return this._fiberRouter.fetch(request);
      }
    } as T;
  };
}

// Change from a strict Record<string, string> to a more flexible type
// that allows for any values in the environment object
type Env = Record<string, unknown>;

function createFpApp() {
  let firstRequest = true;
  return new Hono()
    .basePath("/fp")
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
        mountedPath: "/fp",
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

export function fiberplane<E extends Env>(
  userFetch: (
    request: Request,
    env: E,
    ctx: ExecutionContext,
  ) => Promise<Response>,
) {
  const fpApp = createFpApp();

  return async function fetch(request: Request, env: E, ctx: ExecutionContext) {
    const response = await fpApp.fetch(request, env, ctx);

    if (response.status !== 404) {
      return response;
    }

    return userFetch(request, env, ctx);
  };
}
