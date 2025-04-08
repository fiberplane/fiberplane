import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import type { FiberDecoratedAgent } from "./observed";
import { tryCatch } from "./utils";

// Define types for database schema
export type ColumnType =
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "object"
  | "array";
export type TableSchema = {
  columns: Record<string, ColumnType[]>;
  data: Record<string, unknown>[];
  error?: string;
};
export type DatabaseResult = Record<string, TableSchema>;

/**
 * Creates a router for agent administration endpoints
 */
export function createAgentAdminRouter(agent: FiberDecoratedAgent) {
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
