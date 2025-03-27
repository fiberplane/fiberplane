import type { Agent, Connection, ConnectionContext, WSMessage } from "agents";
import { Hono } from "hono";
import { type SSEStreamingApi, streamSSE } from "hono/streaming";
import {
  getAgents,
  registerAgent,
  registerAgentInstance,
} from "./agentInstances";
import type { AgentEvent } from "./types";
import { isDurableObjectNamespace, toKebabCase, tryCatch } from "./util";

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
          data: streamError.message,
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
 * Class decorator factory that adds Fiber capabilities to Agent classes
 *
 * Usage:
 * ```typescript
 *
 * @Fiber()
 * export class MyAgent extends Agent {
 *   // Your agent implementation
 * }
 * ```
 */
export function Fiber<E = unknown, S = unknown>() {
  return <T extends AgentConstructor<E, S>>(BaseClass: T) => {
    return class extends BaseClass {
      // biome-ignore lint/complexity/noUselessConstructor: Required for TypeScript mixins
      // biome-ignore lint/suspicious/noExplicitAny: Required for TypeScript mixins
      constructor(...args: any[]) {
        super(...args);
        const superClassName = Object.getPrototypeOf(this.constructor).name;
        registerAgent(superClassName);
      }

      fiberRouter?: Hono;

      activeStreams = new Set<SSEStreamingApi>();

      private recordEvent({ event, payload }: AgentEvent) {
        for (const stream of this.activeStreams) {
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

        super.onMessage(connection, message);
      }

      onConnect(connection: Connection, ctx: ConnectionContext) {
        this.recordEvent({
          event: "ws_open",
          payload: {
            connection,
            ctx,
          },
        });

        super.onConnect(connection, ctx);
      }

      onClose(
        connection: Connection,
        code: number,
        reason: string,
        wasClean: boolean,
      ): void {
        this.recordEvent({
          event: "ws_close",
          payload: { connection, code, reason, wasClean },
        });

        super.onClose(connection, code, reason, wasClean);
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

        if (!this.fiberRouter) {
          this.fiberRouter = createAgentAdminRouter(this);
        }
        this.fiberRouter.notFound(() => {
          this.recordEvent({
            event: "http_request",
            payload: {
              method: request.method,
              url: request.url,
              headers: request.headers,
            },
          });
          return super.onRequest(request);
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
              `Warning: durable object detected but it is not decorated with the \`@Fiber()\` decorator (binding name: ${name}, expected namespace: ${namespace})`,
            );
          }
        }
      }

      return c.json(agents);
    })
    .get("*", async (c) => {
      const cdn =
        "https://cdn.jsdelivr.net/npm/@fiberplane/agents@latest/dist/playground/";
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
            <div id="root" />
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
