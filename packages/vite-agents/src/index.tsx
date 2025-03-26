import type { Agent, Connection, ConnectionContext, WSMessage } from "agents";
import { AIChatAgent } from "agents/ai-chat-agent";
import { Hono } from "hono";
import { type SSEStreamingApi, streamSSE } from "hono/streaming";
import { tryCatch } from "./util";
import type { AgentEvent } from "./types";

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
    try {
      const dbResult: DatabaseResult = {};

      // Create tag template array manually to execute raw SQL
      const tablesQuery =
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'";
      const tables = agent.sql(
        Object.assign([tablesQuery], { raw: [tablesQuery] }),
      );

      // Process each table found
      for await (const tableRow of tables) {
        const tableName = String(tableRow.name || "");
        // Skip empty names or the _cf_METADATA table which is not allowed to be accessed
        if (!tableName || tableName === "_cf_METADATA") {
          continue;
        }

        try {
          // Get column information for the table using PRAGMA
          const pragmaQuery = `PRAGMA table_info("${tableName}")`;
          const columnInfo = agent.sql(
            Object.assign([pragmaQuery], { raw: [pragmaQuery] }),
          ) as Array<{
            cid: number; // Column index/position (0-based)
            name: string; // Column name
            type: string; // Declared data type (TEXT, INTEGER, etc.)
            notnull: number; // 1 if NOT NULL constraint exists, 0 if NULL allowed
            dflt_value: unknown; // Default value or null if no default
            pk: number; // 1 if column is part of PRIMARY KEY, 0 otherwise
          }>;

          // Collect column names and initialize column types
          const columns: Record<string, ColumnType[]> = {};
          const columnNames: string[] = [];

          for await (const column of columnInfo) {
            if (column.name) {
              const colName = String(column.name);
              columnNames.push(colName);
              const columnTypes: Array<ColumnType> = [];
              columns[colName] = columnTypes;
              if (column.notnull === 0) {
                columns[colName].push("null");
              }

              // Determine the column type based on the column's declared type
              switch (column.type.toUpperCase()) {
                case "TEXT":
                  columnTypes.push("string");
                  break;
                case "INTEGER":
                  columnTypes.push("number");
                  break;
                case "REAL":
                  columnTypes.push("number");
                  break;
                case "BOOLEAN":
                  columnTypes.push("boolean");
                  break;
                case "BLOB":
                  columnTypes.push("object");
                  break;
                default:
                  columnTypes.push("string");
                  break;
              }
            }
          }

          // If we couldn't get any columns, skip this table
          if (columnNames.length === 0) {
            dbResult[tableName] = {
              columns: {},
              data: [],
              error: "No columns found",
            };
            continue;
          }

          // Get actual data from the table
          const selectQuery = `SELECT * FROM "${tableName}"`;
          const rows = agent.sql(
            Object.assign([selectQuery], { raw: [selectQuery] }),
          );

          // Process rows and collect data
          const data: Record<string, unknown>[] = [];

          for await (const row of rows) {
            const typedRow: Record<string, unknown> = {};

            for (const columnName of columnNames) {
              const value = row[columnName as keyof typeof row];
              typedRow[columnName] = value;
            }

            data.push(typedRow);
          }

          // Add table data to result
          dbResult[tableName] = {
            columns,
            data,
          };
        } catch (error) {
          console.error(`Error processing table ${tableName}:`, error);
          dbResult[tableName] = {
            columns: {},
            data: [],
            error: `Error processing table: ${(error as Error).message}`,
          };
        }
      }

      return c.json(dbResult);
    } catch (error) {
      console.error("Error retrieving database:", error);
      return c.json({ error: "Failed to retrieve database" }, 500);
    }
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
 * @Fiber()
 * export class MyAgent extends Agent {
 *   // Your agent implementation
 * }
 * ```
 */
export function Fiber() {
  return <T extends AgentConstructor>(BaseClass: T) => {
    return class FiberAgent extends BaseClass {
      // biome-ignore lint/complexity/noUselessConstructor: Required for TypeScript mixins
      // biome-ignore lint/suspicious/noExplicitAny: Required for TypeScript mixins
      constructor(...args: any[]) {
        super(...args);
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

        super.onStateUpdate(state, source);
      }

      onMessage(connection: Connection, message: WSMessage) {
        this.recordEvent({
          event: "ws_message",
          payload: {
            connection,
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
        this.recordEvent({
          event: "http_request",
          payload: {
            method: request.method,
            url: request.url,
            headers: request.headers,
          },
        });
        if (!this.fiberRouter) {
          this.fiberRouter = createAgentAdminRouter(this);
        }
        this.fiberRouter.notFound(() => {
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

const agentInstances = new Map<string, string[]>();

export function fiberplane<E extends Env>(
  userFetch: (
    request: Request,
    env: E,
    ctx: ExecutionContext,
  ) => Promise<Response>,
) {
  // Create a Hono app for /fp routes once
  const fpApp = new Hono().basePath("/fp");

  fpApp.get("/", async (c) => {
    const cdn =
      "https://cdn.jsdelivr.net/npm/@fiberplane/agents@latest/dist/playground/";
    const cssBundleUrl = new URL("index.css", cdn).href;
    const jsBundleUrl = new URL("index.js", cdn).href;
    return c.html(
      <html lang="en">
        <head>
          <title>Agents Playground</title>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="stylesheet" href={cssBundleUrl} />
        </head>
        <body>
          <div id="root" />
          <script type="module" src={jsBundleUrl} />
        </body>
      </html>,
    );
  });
  fpApp.get("/agents", async (c) => {
    const agents = Array.from(agentInstances.entries()).map(
      ([namespace, instances]) => ({
        id: namespace,
        className: namespace,
        instances,
      }),
    );
    return c.json(agents);
  });

  // Use notFound instead of throwing an error
  fpApp.notFound(() => {
    return new Response(null, { status: 404 });
  });

  return async function fetch(request: Request, env: E, ctx: ExecutionContext) {
    const url = new URL(request.url);

    // Track agent requests
    const agentPathMatch = url.pathname.match(/^\/agents\/([^\/]+)\/([^\/]+)/);
    if (agentPathMatch) {
      const namespace = agentPathMatch[1];
      const instance = agentPathMatch[2];

      // Record the instance in the agentInstances map
      if (!agentInstances.has(namespace)) {
        agentInstances.set(namespace, []);
      }

      const instances = agentInstances.get(namespace);
      if (instances && !instances.includes(instance)) {
        instances.push(instance);
      }
    }

    const { data: response, error } = await tryCatch(
      fpApp.fetch(request, env, ctx),
    );

    if (!error && response.status !== 404) {
      return response;
    }

    return userFetch(request, env, ctx);
  };
}
