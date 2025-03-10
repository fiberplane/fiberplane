import type { ApiResponse, Workflow } from "@/types";
import {
  type TraceDetailSpansResponse,
  TraceListResponseSchema,
  TraceSummarySchema,
} from "@fiberplane/fpx-types";
import type { UserProfile } from "../auth";
import { FetchOpenApiSpecError, isFailedToFetchError } from "./errors";
import { baseFetch, fpFetch } from "./fetch";
import { safeParseBodyText } from "./utils";

export const api = {
  getWorkflows: async (): Promise<ApiResponse<Workflow[]>> => {
    return fpFetch<ApiResponse<Workflow[]>>("/api/workflows");
  },

  getWorkflow: async (id: string): Promise<ApiResponse<Workflow>> => {
    return fpFetch<ApiResponse<Workflow>>(`/api/workflows/${id}`);
  },

  createWorkflow: async (data: {
    prompt: string;
    openApiSchema: string;
    summary?: string;
    description?: string;
  }): Promise<ApiResponse<Workflow>> => {
    return fpFetch<ApiResponse<Workflow>>("/api/workflows/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },

  updateWorkflow: async (
    id: string,
    data: {
      prompt: string;
      openApiSchemaId: string;
      summary?: string;
      description?: string;
    },
  ): Promise<ApiResponse<Workflow>> => {
    return fpFetch<ApiResponse<Workflow>>(`/api/workflows/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },

  deleteWorkflow: async (id: string): Promise<void> => {
    const transformEmptyResponse = async () => {};
    return fpFetch(
      `/api/workflows/${id}`,
      {
        method: "DELETE",
      },
      transformEmptyResponse,
    );
  },

  executeWorkflow: async (payload: {
    id: string;
    parameters: Record<string, unknown>;
  }): Promise<ApiResponse<Record<string, unknown>>> => {
    const { id, parameters } = payload;
    return fpFetch<ApiResponse<Record<string, unknown>>>(`/w/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parameters),
    });
  },

  getTraces: async ({ limit = 50 }: { limit?: number } = {}) => {
    const data = await fpFetch(`/api/traces?limit=${limit}`);
    return {
      data: TraceListResponseSchema.parse(data),
    };
  },

  getTrace: async (
    id: string,
  ): Promise<ApiResponse<TraceDetailSpansResponse>> => {
    const data = await fpFetch(`/api/traces/${id}/spans`);
    const parsedTrace = TraceSummarySchema.parse({
      traceId: id,
      spans: data,
    });
    return {
      data: parsedTrace.spans,
    };
  },

  // NOTE - This uses browser fetch, since it does some specific error handling of the response
  getOpenApiSpec: async (path: string): Promise<string> => {
    try {
      const response = await fetch(path, {
        // HACK - Force the @fiberplane/hono-otel client library to not trace request to the spec
        headers: {
          "x-fpx-ignore": "true",
        },
      });
      if (!response.ok) {
        const bodyText = await safeParseBodyText(response);
        throw new FetchOpenApiSpecError(
          `Error ${response.status} fetching OpenAPI spec at ${path}`,
          path,
          response.status,
          bodyText,
        );
      }

      return response.text();
    } catch (error) {
      if (isFailedToFetchError(error)) {
        throw new FetchOpenApiSpecError(
          `OpenAPI Spec unreachable at ${path}`,
          path,
        );
      }

      throw new FetchOpenApiSpecError(
        `Unknown error fetching OpenAPI spec at ${path}`,
        path,
      );
    }
  },

  post: async <T>(path: string, data: unknown): Promise<T> => {
    return baseFetch(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },

  // TODO - Return actual response data, with a report id (once we have it)
  createReport: async (data: {
    traceId: string;
    description: string;
  }) => {
    return fpFetch(
      "/api/reports/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        // HACK - Pass a noop as a response parser
      },
      async () => {},
    );
  },

  getTraceSummary: async (data: {
    traceId: string;
    spans: TraceDetailSpansResponse;
  }): Promise<ApiResponse<{ summary: string }>> => {
    // HACK - To avoid excessive requests to the API
    // await new Promise((resolve) => setTimeout(resolve, 1500));
    // return {
    //   data: {
    //     summary:
    //       "The trace shows a successful GET request to `/fp/api/workflow` on `localhost:8787`, which then makes a client call to `https://playground-services.mies.workers.dev/api/workflow`. Both requests returned a `200 OK` status. The total duration of the server request was ~1.15s, with the client call taking ~1.15s. The response body contains workflow data. No obvious performance bottlenecks or errors are apparent.",
    //   },
    // };
    // // biome-ignore lint/correctness/noUnreachable: FOR TESTING PURPOSES
    return fpFetch("/api/assistant/trace-summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },

  /**
   * Mock API call to get user profile
   */
  getUserProfile: async (): Promise<ApiResponse<UserProfile>> => {
    // Simulate latency
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return {
      data: {
        id: "852a1147-465e-4048-bc2f-47add2b2fd4f",
        email: "brbeut@gmail.com",
        role: "owner",
        githubUserId: 3201327,
        // createdAt: "2025-03-05T13:54:50.000Z",
        // updatedAt: "2025-03-05T13:54:50.000Z"
      },
    };
    // THIS IS READY TO TEST!!!
    //
    // return fpFetch("/api/auth/profile");
  },
};
