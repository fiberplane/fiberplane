import type { Agent, Connection, ConnectionContext, WSMessage } from "agents";
import { Hono } from "hono";
import { type SSEStreamingApi, streamSSE } from "hono/streaming";
import packageJson from "../package.json" assert { type: "json" };
import {
  getAgents,
  registerAgent,
  registerAgentInstance,
} from "./agentInstances";
import { type AgentEvent, agentEventSchema } from "./types";
import {
  createRequestPayload,
  createResponsePayload,
  isDurableObjectNamespace,
  isPromiseLike,
  toKebabCase,
  tryCatch,
} from "./utils";

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
const commitHash = import.meta.env.GIT_COMMIT_HASH ?? "";

function createAgentAdminRouter(agent: FiberDecoratedAgent) {
  const router = new Hono();

  router.get("/agents/:namespace/:instance/admin/db", async (c) => {
    const fetchDbResult = async () => {
      // Get all table names
      const tablesQuery =
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'";
      const tablesResult = await tryCatch(
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
        const columnInfoResult = await tryCatch(
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
        const rowsResult = await tryCatch(
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

    const result = await tryCatch(fetchDbResult());

    if (result.error) {
      console.error("Error retrieving database:", result.error);
      return c.json({ error: "Failed to retrieve database" }, 500);
    }

    return c.json(result.data);
  });

  router.get("/agents/:namespace/:instance/admin/events", async (c) => {
    if (!agent.activeStreams) {
      agent.activeStreams = new Set();
    }
    return streamSSE(
      c,
      async (stream) => {
        agent.activeStreams.add(stream);

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
          data: JSON.stringify(streamError.message),
        });
        agent.activeStreams.delete(stream);
      },
    );
  });

  return router;
}

interface FiberProperties {
  activeStreams: Set<SSEStreamingApi>;
}

type FiberDecoratedAgent = Agent<unknown, unknown> & FiberProperties;

/**
 * Class decorator factory that adds Observed capabilities to Agent classes
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
      // Store the class name of the super class
      private superClassName: string;

      // Store whether we've registered the instance already
      private instanceRegistered = false;

      // biome-ignore lint/complexity/noUselessConstructor: Required for TypeScript mixins
      // biome-ignore lint/suspicious/noExplicitAny: Required for TypeScript mixins
      constructor(...args: any[]) {
        super(...args);
        this.superClassName = Object.getPrototypeOf(this.constructor).name;
        registerAgent(this.superClassName);
      }

      fiberRouter?: Hono;

      activeStreams = new Set<SSEStreamingApi>();

      private recordEvent(event: AgentEvent) {
        if (!this.instanceRegistered) {
          this.instanceRegistered = true;
          registerAgentInstance(this.superClassName, this.name);
        }

        const { type: eventName, payload } = event;
        for (const stream of this.activeStreams) {
          stream.writeSSE({
            event: eventName,
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

        super.onStateUpdate(state as S, source);
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
                return Reflect.get(target, prop, receiver).call(
                  target,
                  message,
                );
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
        if (!this.fiberRouter) {
          this.fiberRouter = createAgentAdminRouter(this);
        }

        this.fiberRouter.notFound(() => {
          // Extract url & method for re-use in the response payload
          const { url, method } = request;

          // Create a promise chain to ensure the event is recorded
          // since we may need to read the body of the request
          const eventPromise = Promise.resolve().then(async () => {
            this.recordEvent({
              type: "http_request",
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

        return this.fiberRouter.fetch(request);
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
      const cdn = `https://cdn.jsdelivr.net/npm/@fiberplane/agents@${version ? version : "latest"}/dist/playground/`;
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
    const { data: response, error } = await tryCatch(
      fpApp.fetch(request, env, ctx),
    );

    if (!error && response.status !== 404) {
      return response;
    }

    return userFetch(request, env, ctx);
  };
}
