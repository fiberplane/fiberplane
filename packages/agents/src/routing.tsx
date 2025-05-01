import { getAgentByName, getAgentEventStream } from "agents";
import Cloudflare from "cloudflare";
import { Hono } from "hono";
import {
  //  SSEStreamingApi,
  streamSSE,
} from "hono/streaming";
import packageJson from "../package.json" assert { type: "json" };
import {
  getAgents,
  // getEventEmitter,
  // type TinyEmitter,
  // type EventPayloads,
} from "./agentInstances";
import {
  type ColumnType,
  type DatabaseResult,
  aiGatewayEnvSchema,
} from "./types";
import {
  type Result,
  // createRequestPayload,
  getDurableObjectAgentNamespace,
  tryCatchAsync,
} from "./utils";
// import type { number } from "zod";

const version = packageJson.version;
const commitHash =
  typeof __COMMIT_HASH__ !== "undefined" ? __COMMIT_HASH__ : "";

function createFpApp(customPath = "/fp") {
  const app = new Hono().basePath(customPath);
  const api = new Hono();
  api.get("/agents", async (c) => {
    const agents = getAgents();

    return c.json(agents);
  });

  api.get("/agents/:namespace/:instance/admin/events", async (c) => {
    const { namespace: rawNamespace, instance } = c.req.param();
    const durableObject = getDurableObjectAgentNamespace(c.env, rawNamespace);

    if (!durableObject) {
      console.warn("Agent not found", rawNamespace);
      return c.json(
        {
          error: `Agent ${rawNamespace} not found`,
        },
        404,
      );
    }

    const doInstance = await getAgentByName(durableObject, instance);
    if (!doInstance) {
      console.warn("Agent instance not found", instance);
      return c.json(
        {
          error: `Agent instance ${instance} not found`,
        },
        404,
      );
    }
    const response = await getAgentEventStream(doInstance);

    if (!response.body) {
      return;
    }
    const body = response.body;
    // console.log('body', response.body);

    return streamSSE(
      c,
      async (stream) => {
        stream.pipe(body);
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
        // } catch (error) {
        //   console.error("Error in stream:", error);
        // }
      },
      async (streamError, stream) => {
        console.error("Error in stream:", streamError);
        // if (eventWriter) {
        //   emitter.offAny(eventWriter);
        // }
        stream.writeSSE({
          event: "stream_error",
          data: JSON.stringify(streamError.message),
        });
        // agent._activeStreams.delete(stream);
      },
    );
  });

  api.get("/agents/:namespace/:instance/admin/db", async (c) => {
    const { namespace: rawNamespace, instance } = c.req.param();
    const durableObject = getDurableObjectAgentNamespace(c.env, rawNamespace);
    if (!durableObject) {
      console.warn("Agent not found", rawNamespace);
      return c.json(
        {
          error: `Agent ${rawNamespace} not found`,
        },
        404,
      );
    }
    const agent = await getAgentByName(durableObject, instance);
    if (!agent) {
      console.warn("Agent instance not found", instance);
      return c.json(
        {
          error: `Agent instance ${instance} not found`,
        },
        404,
      );
    }
    const fetchDbResult = async () => {
      // Get all table names
      const tablesQuery =
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'";
      const tablesResult: Result<
        Record<string, string | number | boolean | null>[],
        Error
      > = await tryCatchAsync(
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
        const columnInfoResult: Result<
          Record<string, string | number | boolean | null>[],
          Error
        > = await tryCatchAsync(
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
        const rowsResult: Result<
          Record<string, string | number | boolean | null>[],
          Error
        > = await tryCatchAsync(
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

  api.get("/agents/:namespace/:instance/admin/mcp", async (c) => {
    const { namespace: rawNamespace, instance } = c.req.param();
    const durableObject = getDurableObjectAgentNamespace(c.env, rawNamespace);
    if (!durableObject) {
      console.warn("Agent not found", rawNamespace);
      return c.json(
        {
          error: `Agent ${rawNamespace} not found`,
        },
        404,
      );
    }
    const agent = await getAgentByName(durableObject, instance);
    if (!agent) {
      console.warn("Agent instance not found", instance);
      return c.json(
        {
          error: `Agent instance ${instance} not found`,
        },
        404,
      );
    }

    const connections = await agent.listMcpConnections();
    return c.json({ data: connections });
  });

  // List all available AI gateways
  api.get("/agents/:namespace/:instance/admin/ai-gateways", async (c) => {
    // Extract required environment variables
    const parsedEnv = aiGatewayEnvSchema.safeParse(c.env);
    if (!parsedEnv.success) {
      console.error(
        "ai-gateways: Invalid environment variables:",
        parsedEnv.error,
      );
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
  api.get(
    "/agents/:namespace/:instance/admin/ai-gateways/:id/logs",
    async (c) => {
      // Extract required environment variables

      const parsedEnv = aiGatewayEnvSchema.safeParse(c.env);
      if (!parsedEnv.success) {
        console.error(
          "ai-gateways/id/logs: Invalid environment variables:",
          parsedEnv.error,
        );
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
  api.get(
    "/agents/:namespace/:instance/admin/ai-gateways/:id/logs/:logId",
    async (c) => {
      // Extract required environment variables
      const parsedEnv = aiGatewayEnvSchema.safeParse(c.env);
      if (!parsedEnv.success) {
        console.error(
          "ai-gateways/id/logs/logId: Invalid environment variables:",
          parsedEnv.error,
        );
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

  app.route("/api", api);
  // app.route("/api", api)

  app.get("*", async (c) => {
    const options = {
      mountedPath: customPath,
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
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="stylesheet" href={cssBundleUrl} />
        </head>
        <body>
          <div id="root" data-options={JSON.stringify(options)} />
          <script type="module" src={jsBundleUrl} />
        </body>
      </html>,
    );
  });

  return app;
}

interface FiberplaneEntryWrapperOptions {
  customPath?: string;
}

/**
 * Creates a fetch handler that serves the Fiberplane app
 */
export function fiberplane<E = unknown>(
  userFetch: (
    request: Request,
    env: E,
    ctx: ExecutionContext,
  ) => Promise<Response>,
  options?: FiberplaneEntryWrapperOptions,
) {
  const fpApp = createFpApp(options?.customPath);

  return async function fetch(request: Request, env: E, ctx: ExecutionContext) {
    const newRequest = new Request(request);
    const response = await fpApp.fetch(newRequest, env, ctx);
    if (response.status !== 404) {
      // If the response is not 404, return it
      return response;
    }

    return userFetch(request, env, ctx);
  };
}
