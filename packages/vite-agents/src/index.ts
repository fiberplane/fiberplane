import type { Agent, Connection, ConnectionContext, WSMessage } from "agents";
import { AIChatAgent } from "agents/ai-chat-agent";
import { Hono } from "hono";
import { type SSEStreamingApi, streamSSE } from "hono/streaming";
import type { AgentEvent } from "./vite/types";

// Define types for database schema
type ColumnType = "string" | "number" | "boolean" | "null" | "object" | "array";
type TableSchema = {
  columns: Record<string, ColumnType[]>;
  data: Record<string, unknown>[];
  error?: string;
};
type DatabaseResult = Record<string, TableSchema>;

type AgentConstructor<E = unknown, S = unknown> = new (
  // biome-ignore lint/suspicious/noExplicitAny: TypeScript's mixin pattern requires any[]
  ...args: any[]
) => Agent<E, S>;

function createAgentAdminRouter(agent: FiberDecoratedAgent) {
  const router = new Hono();

  router.get("/agents/:namespace/:instance/db", async (c) => {
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
          );

          // Collect column names and initialize column types
          const columns: Record<string, ColumnType[]> = {};
          const columnNames: string[] = [];

          for await (const column of columnInfo) {
            if (column.name) {
              const colName = String(column.name);
              columnNames.push(colName);
              columns[colName] = [];
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

              // Track column types
              const valueType = getValueType(value);
              if (!columns[columnName].includes(valueType)) {
                columns[columnName].push(valueType);
              }
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

  router.get("/agents/:namespace/:instance/events", async (c) => {
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

// Utility function to determine the type of a value
function getValueType(value: unknown): ColumnType {
  if (value === null) {
    return "null";
  }

  const type = typeof value;
  if (type === "string" || type === "number" || type === "boolean") {
    return type;
  }

  if (type === "object") {
    if (Array.isArray(value)) {
      return "array";
    }
    return "object";
  }

  return "string"; // Default fallback
}
