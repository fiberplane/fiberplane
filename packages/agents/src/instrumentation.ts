import type { Agent, Connection, ConnectionContext, WSMessage } from "agents";
import type { MCPClientManager } from "agents/mcp/client";
import Cloudflare from "cloudflare";
import { Hono } from "hono";
// import type { SSEStreamingApi } from "hono/streaming";
import { type SSEStreamingApi, streamSSE } from "hono/streaming";
import type { BlankEnv } from "hono/types";
import { registerAgent, registerAgentInstance } from "./agentInstances";
import {
  type AgentEvent,
  type ColumnType,
  type DatabaseResult,
  type MCPClientConnection,
  aiGatewayEnvSchema,
} from "./types";
import {
  PARTYKIT_NAMESPACE_HEADER,
  PARTYKIT_ROOM_HEADER,
  createRequestPayload,
  createResponsePayload,
  isPromiseLike,
  tryCatch,
  tryCatchAsync,
} from "./utils";

// biome-ignore lint/suspicious/noExplicitAny: mixin pattern requires generic constructor parameters
export type ConstructorType<T> = new (...args: any[]) => T;

type ObservedAgent = Agent<unknown, unknown> & InstrumentedProperties;

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
        .filter((name) => name && name !== "_cf_METADATA" && name !== "_cf_KV");

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
    agent._mcpConnections = detectMCPConnections(
      agent as unknown as Record<string, unknown>,
    );

    if (agent._mcpConnections && agent._mcpConnections.size > 0) {
      const connections = Array.from(agent._mcpConnections).map(
        ([serverId, conn]) => {
          return {
            serverId,
            url: conn.url,
            connectionState: conn.connectionState,
            instructions: conn.instructions,
            tools: conn.tools,
            resources: conn.resources,
            prompts: conn.prompts,
            serverCapabilities: conn.serverCapabilities,
          };
        },
      );
      return c.json({ data: connections });
    }
    return c.json({});
  });

  router.get("/agents/:namespace/:instance/admin/events", async (c) => {
    if (!agent._activeStreams) {
      agent._activeStreams = new Set();
    }
    return streamSSE(
      c,
      async (stream) => {
        try {
          agent._activeStreams.add(stream);

          await stream.writeSSE({
            event: "stream_open",
            data: "",
          });

          // Keep the connection open with a heartbeat
          let heartbeatCount = 0;
          while (!stream.closed && !stream.aborted) {
            // Send a heartbeat every 30 seconds to keep the connection alive
            await stream.sleep(3000);
            await stream.writeSSE({
              event: "heartbeat",
              data: String(heartbeatCount++),
            });
          }
        } catch (error) {
          console.error("Error in stream:", error);
        }
      },
      async (streamError, stream) => {
        console.error("Error in stream:", streamError);
        stream.writeSSE({
          event: "stream_error",
          data: JSON.stringify(streamError.message),
        });
        agent._activeStreams.delete(stream);
      },
    );
  });

  // List all available AI gateways
  router.get("/agents/:namespace/:instance/admin/ai-gateways", async (c) => {
    // Extract required environment variables
    const parsedEnv = aiGatewayEnvSchema.safeParse(c.env);
    if (!parsedEnv.success) {
      console.error("Invalid environment variables:", parsedEnv.error);
      return c.json(
        {
          error: "Missing or invalid environment variables",
          details: parsedEnv.error.format(),
        },
        422,
      );
    }

    const client = new Cloudflare({
      apiToken: parsedEnv.data.CLOUDFLARE_API_TOKEN,
    });

    const gateways = await client.aiGateway.list({
      account_id: parsedEnv.data.CLOUDFLARE_ACCOUNT_ID,
    });

    if (!gateways) {
      return c.json({ error: "Failed to retrieve gateways" }, 500);
    }
    return c.json(gateways.result);
  });

  // Get log list for a specific AI gateway
  router.get(
    "/agents/:namespace/:instance/admin/ai-gateways/:id/logs",
    async (c) => {
      // Extract required environment variables

      const parsedEnv = aiGatewayEnvSchema.safeParse(c.env);
      if (!parsedEnv.success) {
        console.error("Invalid environment variables:", parsedEnv.error);
        return c.json(
          {
            error: "Missing or invalid environment variables",
            details: parsedEnv.error.format(),
          },
          422,
        );
      }

      const client = new Cloudflare({
        apiToken: parsedEnv.data.CLOUDFLARE_API_TOKEN,
      });
      const { id } = c.req.param();

      const logs = await client.aiGateway.logs.list(id, {
        account_id: parsedEnv.data.CLOUDFLARE_ACCOUNT_ID,
      });

      if (!logs) {
        return c.json({ error: "Failed to retrieve logs" }, 500);
      }

      return c.json(logs.result);
    },
  );

  // Get log details for a specific gateway/log
  router.get(
    "/agents/:namespace/:instance/admin/ai-gateways/:id/logs/:logId",
    async (c) => {
      // Extract required environment variables
      const parsedEnv = aiGatewayEnvSchema.safeParse(c.env);
      if (!parsedEnv.success) {
        console.error("Invalid environment variables:", parsedEnv.error);
        return c.json(
          {
            error: "Missing or invalid environment variables",
            details: parsedEnv.error.format(),
          },
          422,
        );
      }

      const client = new Cloudflare({
        apiToken: parsedEnv.data.CLOUDFLARE_API_TOKEN,
      });
      const { id, logId } = c.req.param();

      const log = await client.aiGateway.logs.get(id, logId, {
        account_id: parsedEnv.data.CLOUDFLARE_ACCOUNT_ID,
      });

      if (!log) {
        return c.json({ error: "Failed to retrieve log" }, 500);
      }

      return c.json(log);
    },
  );

  return router;
}

interface InstrumentedProperties {
  _activeStreams: Set<SSEStreamingApi>;
  _mcpConnections?: Map<string, MCPClientConnection>;
  _fiberRouter?: Hono;
}

/**
 * Mixin factory that adds instruments the Agent class with observability capabilities
 * allowing it to be viewed in the Fiberplane agents playground
 *
 * Usage:
 * ```typescript
 * export class MyCoreAgent extends Agent<Env, MyState> {
 *   // Your agent implementation
 * }
 *
 * // Creates a new class that extends MyCoreAgent with observability features
 * const MyAgent = withInstrumentation(MyCoreAgent);
 * ```
 */
export function withInstrumentation<BaseAgent extends Agent<BlankEnv, unknown>>(
  BaseClass: ConstructorType<BaseAgent>,
): ConstructorType<BaseAgent & InstrumentedProperties> {
  return class ObservedAgent
    extends (BaseClass as ConstructorType<Agent<BlankEnv, unknown>>)
    implements InstrumentedProperties
  {
    _fiberRouter?: Hono;
    _activeStreams = new Set<SSEStreamingApi>();
    _mcpConnections?: Map<string, MCPClientConnection>;

    // biome-ignore lint/suspicious/noExplicitAny: mixin pattern requires any[]
    constructor(...args: any[]) {
      super(...args);
      const superClassName = Object.getPrototypeOf(this.constructor).name;
      registerAgent(superClassName);
    }

    private recordEvent({ type, payload }: AgentEvent) {
      for (const stream of this._activeStreams) {
        stream.writeSSE({
          event: type,
          data: JSON.stringify(payload),
        });
      }
    }

    onStateUpdate(state: unknown, source: Connection | "server"): void {
      const sourceId = source === "server" ? "server" : source.id;
      this.recordEvent({
        type: "state_change",
        payload: {
          state,
          source: sourceId,
        },
      });

      this._mcpConnections = detectMCPConnections(
        this as unknown as Record<string, unknown>,
      );

      // Cast state to S to satisfy the type constraint of the parent class
      super.onStateUpdate(state, source);
    }

    onStart() {
      super.onStart();
      this._mcpConnections = detectMCPConnections(
        this as unknown as Record<string, unknown>,
      );
    }

    override broadcast(
      msg: string | ArrayBuffer | ArrayBufferView,
      without?: string[] | undefined,
    ): void {
      this.recordEvent({
        type: "broadcast",
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
                type: "ws_send",
                payload: {
                  connectionId: target.id,
                  message:
                    typeof message === "string"
                      ? message
                      : {
                          type: "binary" as const,
                          size:
                            message instanceof Blob
                              ? message.size
                              : message.byteLength,
                        },
                },
              });

              // Call the original send method
              return Reflect.get(target, prop, receiver).call(target, message);
            };
          }

          // Return other properties/methods unchanged
          return Reflect.get(target, prop, receiver);
        },
      });
    }

    onMessage(connection: Connection, message: WSMessage) {
      this.recordEvent({
        type: "ws_message",
        payload: {
          connectionId: connection.id,
          message:
            typeof message === "string"
              ? message
              : { type: "binary", size: message.byteLength },
        },
      });

      const connectionProxy = this.createWebSocketProxy(connection);

      // Use the original connection for the parent class
      return super.onMessage(connectionProxy, message);
    }

    onConnect(connection: Connection, ctx: ConnectionContext) {
      this.recordEvent({
        type: "ws_open",
        payload: {
          connectionId: connection.id,
        },
      });

      this._mcpConnections = detectMCPConnections(
        this as unknown as Record<string, unknown>,
      );

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
        type: "ws_close",
        payload: { connectionId: connection.id, code, reason, wasClean },
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
          "Missing namespace and/or instance headers in request",
          request.headers,
          { namespace, instance },
        );
      }

      if (!this._fiberRouter) {
        this._fiberRouter = createAgentAdminRouter(this);

        this._fiberRouter.notFound((c) => {
          // Extract url & method for re-use in the response payload
          const { url, method } = c.req;

          // Create a promise chain to ensure the event is recorded
          // since we may need to read the body of the request
          const eventPromise = Promise.resolve().then(async () => {
            this.recordEvent({
              type: "http_request",
              // Clone the request to avoid consuming the body
              payload: await createRequestPayload(
                c.req.raw.clone() as typeof c.req.raw,
              ),
            });
          });
          const result = super.onRequest(c.req.raw);

          if (isPromiseLike(result)) {
            return Promise.all([result, eventPromise]).then(async ([res]) => {
              const payload = await createResponsePayload(res.clone());
              this.recordEvent({
                type: "http_response",
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
              type: "http_response",
              payload: {
                ...payload,
                url,
                method,
              },
            });
          });

          return result;
        });
      }

      return this._fiberRouter.fetch(request);
    }
  } as unknown as ConstructorType<BaseAgent & InstrumentedProperties>;
}

function isMCPClientManagerLike(value: unknown): value is MCPClientManager {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).mcpConnections === "object" &&
    (value as Record<string, unknown>).mcpConnections !== null &&
    !Array.isArray((value as Record<string, unknown>).mcpConnections)
  );
}

/**
 * Detects all MCP connections from MCPClientManager instances on the object
 * @returns A flat set of all MCP connections
 */
function detectMCPConnections(obj: Record<string, unknown>) {
  const connections = new Map<string, MCPClientConnection>();

  for (const [_, value] of Object.entries(obj)) {
    if (!value || typeof value !== "object") {
      continue;
    }
    if (isMCPClientManagerLike(value)) {
      const managerConnections = value.mcpConnections;
      if (managerConnections && typeof managerConnections === "object") {
        for (const [serverId, conn] of Object.entries(managerConnections)) {
          connections.set(serverId, conn);
        }
      }
    }
  }

  return connections;
}
