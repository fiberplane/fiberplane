import { Hono } from "hono";
import type { Env } from "hono";
import { contextStorage } from "hono/context-storage";
import { HTTPException } from "hono/http-exception";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createFiberplane } from "../../middleware";
import type { Workflow } from "../../schemas/workflows";
import type { FiberplaneAppType } from "../../types";

const mockWorkflow: Workflow = {
  workflowId: "test-workflow",
  description: "Test workflow",
  prompt: "test workflow execution",
  summary: "Test workflow execution",
  createdAt: new Date(),
  updatedAt: new Date(),
  inputs: {
    type: "object",
    properties: {
      name: { type: "string" },
      description: { type: "string" },
    },
    required: ["name"],
  },
  steps: [
    {
      stepId: "checkContext",
      description: "Try to access execution context",
      operation: {
        path: "/api/context-check",
        method: "get",
      },
      parameters: [],
      outputs: [],
      successCriteria: [{ condition: "$response.statusCode === 200" }],
    },
    {
      stepId: "createResource",
      description: "Create a test resource",
      operation: {
        path: "/api/resources",
        method: "post",
      },
      parameters: [
        {
          name: "name",
          in: "query",
          value: "$inputs.name",
        },
        {
          name: "description",
          in: "query",
          value: "$inputs.description",
        },
      ],
      requestBody: {
        contentType: "application/json",
        payload: {
          name: "$inputs.name",
          description: "$inputs.description",
        },
        replacements: [],
      },
      successCriteria: [{ condition: "$response.statusCode === 201" }],
      outputs: [{ key: "resourceId", value: "$response.body#/data/id" }],
    },
    {
      stepId: "getResource",
      description: "Get the created resource",
      operation: {
        path: "/api/resources/{resourceId}",
        method: "get",
      },
      parameters: [
        {
          name: "resourceId",
          in: "path",
          value: "$steps.createResource.outputs.resourceId",
        },
      ],
      successCriteria: [{ condition: "$response.statusCode === 200" }],
      outputs: [{ key: "resource", value: "$response.body#/data" }],
    },
  ],
  outputs: [
    { key: "resourceId", value: "$steps.createResource.outputs.resourceId" },
    { key: "resource", value: "$steps.getResource.outputs.resource" },
  ],
};

vi.mock("./utils", () => ({
  getWorkflowById: vi.fn().mockImplementation(async (workflowId: string) => {
    if (workflowId === "test-workflow") {
      return { data: mockWorkflow };
    }
    throw new HTTPException(404, {
      message: "Workflow not found",
    });
  }),
}));

describe("Workflow Runner", () => {
  let app: Hono<FiberplaneAppType<Env>>;
  const mockApiKey = "test-api-key";

  const mockExecutionCtx = {
    waitUntil: vi.fn(),
    passThroughOnException: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Create the app with test routes
    app = new Hono<FiberplaneAppType<Env>>();

    app.get("/api/context-check", async (c) => {
      const ctx = c.executionCtx;
      return c.json({ ctx });
    });

    app.post("/api/resources", async (c) => {
      return c.json(
        {
          data: {
            id: "test-resource-id",
            name: "Test Resource",
            description: "Test Description",
          },
        },
        201,
      );
    });

    app.get("/api/resources/:id", async (c) => {
      return c.json(
        {
          data: {
            id: "test-resource-id",
            name: "Test Resource",
            description: "Test Description",
            status: "active",
          },
        },
        200,
      );
    });

    // Add the Fiberplane middleware
    app.use(
      "/*",
      createFiberplane({
        app,
        apiKey: mockApiKey,
        debug: true,
      }),
    );
  });

  it("mock app should have executionCtx", async () => {
    const res = await app.request(
      "/api/context-check",
      {},
      {},
      mockExecutionCtx,
    );
    expect(res.status).toBe(200);
  });

  it("should execute a workflow successfully", async () => {
    const res = await app.request(
      "/w/test-workflow",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Test Resource",
          description: "Test Description",
        }),
      },
      {},
      mockExecutionCtx,
    );

    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data).toEqual({
      resourceId: "test-resource-id",
      resource: {
        id: "test-resource-id",
        name: "Test Resource",
        description: "Test Description",
        status: "active",
      },
    });
  });

  it("should not fail when trying to access executionCtx", async () => {
    const res = await app.request(
      "/w/test-workflow",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Test Resource",
          description: "Test Description",
        }),
      },
      {},
      mockExecutionCtx,
    );

    expect(res.status).toBe(200);
  });

  it("should validate workflow inputs", async () => {
    const res = await app.request(
      "/w/test-workflow",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          description: "Test Description",
          // Missing required 'name' field
        }),
      },
      {},
      mockExecutionCtx,
    );

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("required");
  });

  it("should handle workflow step failures", async () => {
    // Create a new app with failing endpoints
    const failureApp = new Hono<FiberplaneAppType<Env>>();

    failureApp.post("/api/resources", async (c) => {
      return c.json({ error: "Not implemented" }, 501);
    });

    failureApp.use(contextStorage());
    failureApp.use(
      "/*",
      createFiberplane({
        app: failureApp,
        apiKey: mockApiKey,
        debug: true,
      }),
    );

    const res = await failureApp.request(
      "/w/test-workflow",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Test Resource",
          description: "Test Description",
        }),
      },
      {},
      mockExecutionCtx,
    );

    const data = await res.json();
    expect(res.status).toBe(501);
    expect(data.error.details.stepId).toBe("createResource");
  });

  it("should handle non-existent workflows", async () => {
    const res = await app.request(
      "/w/non-existent-workflow",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Test Resource",
        }),
      },
      {},
      mockExecutionCtx,
    );

    expect(res.status).toBe(404);
  });
});
