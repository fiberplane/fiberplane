import { Hono } from "hono";
import type { Env } from "hono";
import { contextStorage } from "hono/context-storage";
import { HTTPException } from "hono/http-exception";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Step, Workflow } from "../../schemas/workflows.js";
import type { FiberplaneAppType } from "../../types.js";
import createRunnerRoute from "./index.js";

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
        method: "get"
      },
      successCriteria: [{ condition: "$response.statusCode === 200" }]
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

vi.mock("./utils.js", () => ({
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
  let app: Hono;
  const mockApiKey = "test-api-key";

  beforeEach(() => {
    vi.clearAllMocks();

    app = new Hono();

    app.get("/api/context-check", async (c) => {
      // This should fail since executionCtx is not available
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

    const runnerApp = new Hono<FiberplaneAppType<Env>>();

    runnerApp.use(contextStorage());

    runnerApp.use<"*", FiberplaneAppType<Env>>("*", async (c, next) => {
      c.set("userApp", app);
      c.set("userEnv", {});
      c.set("debug", true);
      await next();
    });

    runnerApp.route("/w", createRunnerRoute(mockApiKey));
    app.route("/", runnerApp);
  });

  it("should execute a workflow successfully", async () => {
    const res = await app.request("/w/test-workflow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test Resource",
        description: "Test Description",
      }),
    });

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

  it("should fail when trying to access executionCtx", async () => {
    const res = await app.request("/w/test-workflow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test Resource",
        description: "Test Description"
      }),
    });

    expect(res.status).toBe(500);
    const data = await res.json();
    expect(data.error.details.stepId).toBe("checkContext");
  });

  it("should validate workflow inputs", async () => {
    const res = await app.request("/w/test-workflow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        description: "Test Description",
        // Missing required 'name' field
      }),
    });

    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toContain("required");
  });

  it("should handle workflow step failures", async () => {
    const failureApp = new Hono();

    failureApp.post("/api/resources", async (c) => {
      return c.json({ error: "Not implemented" }, 501);
    });

    const runnerApp = new Hono<FiberplaneAppType<Env>>();

    runnerApp.use(contextStorage());

    runnerApp.use<"*", FiberplaneAppType<Env>>("*", async (c, next) => {
      c.set("userApp", failureApp);
      c.set("userEnv", {});
      c.set("debug", true);
      await next();
    });

    runnerApp.route("/w", createRunnerRoute(mockApiKey));
    failureApp.route("/", runnerApp);

    const res = await failureApp.request("/w/test-workflow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test Resource",
        description: "Test Description",
      }),
    });

    const data = await res.json();
    expect(res.status).toBe(501);
    expect(data.error.details.stepId).toBe("createResource");
  });

  it("should handle non-existent workflows", async () => {
    const res = await app.request("/w/non-existent-workflow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test Resource",
      }),
    });

    expect(res.status).toBe(404);
  });
});
