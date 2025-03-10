// TODO: ideally we'd replace this with a zod validator but cheaper and simpler
// to use a basic json schema validator for now
import { Validator } from "@cfworker/json-schema";
import { sValidator } from "@hono/standard-validator";
import { type Env, Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { logIfDebug } from "../../debug";
import type { Step, Workflow } from "../../schemas/workflows";
import type { FiberplaneAppType } from "../../types";
import { getContext } from "../../utils";
import {
  type HttpRequestParams,
  type WorkflowContext,
  resolveStepOutputs,
  resolveStepParams,
} from "./resolvers";
import { resolveOutputs } from "./resolvers";
import { getWorkflowById } from "./utils";

interface WorkflowErrorResponse {
  error: {
    type: "WORKFLOW_ERROR";
    message: string;
    details: {
      stepId: string;
      method: string;
      path: string;
      parameters?: unknown;
    };
  };
}

class WorkflowError extends HTTPException {
  constructor(
    status: number,
    message: string,
    public readonly stepId: string,
    public readonly operation: {
      method: string;
      path: string;
      parameters?: unknown;
    },
    public readonly cause?: unknown,
  ) {
    super(status as 400 | 401 | 403 | 404 | 500, {
      message,
      cause,
    });
  }

  toResponse(): WorkflowErrorResponse {
    return {
      error: {
        type: "WORKFLOW_ERROR",
        message: this.message,
        details: {
          stepId: this.stepId,
          method: this.operation.method,
          path: this.operation.path,
          parameters: this.operation.parameters,
        },
      },
    };
  }
}

export default function createRunnerRoute<E extends Env>(
  apiKey: string,
  fiberplaneServicesUrl: string,
) {
  const runner = new Hono<E & FiberplaneAppType<E>>().post(
    "/:workflowId",
    sValidator("param", z.object({ workflowId: z.string() })),
    async (c) => {
      const { workflowId } = c.req.valid("param");
      const partitionKey = c.req.header("X-Fiberplane-Partition-Key");

      if (!partitionKey) {
        return c.json(
          { error: "Missing `X-Fiberplane-Partition-Key` header" },
          400,
        );
      }

      const { data: workflow } = await getWorkflowById(
        workflowId,
        apiKey,
        fiberplaneServicesUrl,
        partitionKey,
      );

      const validator = new Validator(workflow.inputs);

      const body = await c.req.json();

      const { valid, errors } = validator.validate(body);
      if (!valid) {
        const errorMessage = errors.map((error) => error.error).join("\n");
        return c.json({ error: errorMessage }, 400);
      }

      const context = getContext<E & FiberplaneAppType<E>>();
      const userApp = context.get("userApp");
      if (!userApp) {
        return c.json(
          {
            type: "CONFIGURATION_ERROR",
            message: "Missing `app` parameter for @fiberplane/hono middleware",
          },
          500,
        );
      }

      try {
        const result = await executeWorkflow(workflow, body);
        return c.json(result);
      } catch (error) {
        if (error instanceof WorkflowError) {
          return c.json(error.toResponse(), error.status);
        }
        throw error;
      }
    },
  );

  return runner;
}

async function executeWorkflow(
  workflow: Workflow,
  inputs: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const workflowContext: WorkflowContext = {
    inputs,
    steps: {},
  };

  for (const step of workflow.steps) {
    try {
      const resolvedParams = await resolveStepParams(step, workflowContext);
      const response = await executeStep(step, resolvedParams);
      if (response.statusCode >= 400) {
        throw new WorkflowError(
          response.statusCode,
          `Workflow ${workflow.workflowId} failed. Failed at ${step.stepId}, operation: ${step.operation.method.toUpperCase()} ${step.operation.path}. Error: ${JSON.stringify(response.body, null, 2)}`,
          step.stepId,
          { ...step.operation, parameters: resolvedParams },
        );
      }
      const outputs = resolveStepOutputs(step, response);
      workflowContext.steps[step.stepId] = {
        ...(outputs ? { outputs } : {}),
      };
    } catch (error) {
      if (error instanceof WorkflowError) {
        throw error;
      }

      throw new WorkflowError(
        500,
        `Workflow ${workflow.workflowId} failed. Failed at ${step.stepId}, operation: ${step.operation.method.toUpperCase()} ${step.operation.path}. Error: ${error}`,
        step.stepId,
        step.operation,
      );
    }
  }

  return resolveOutputs(workflow, workflowContext);
}

async function executeStep<E extends Env>(
  step: Step,
  params: HttpRequestParams,
): Promise<{ statusCode: number; body: unknown }> {
  const c = getContext<E & FiberplaneAppType<E>>();
  const userApp = c.get("userApp");
  const userEnv = c.get("userEnv");
  const userExecutionCtx = c.get("userExecutionCtx");
  const baseUrl = new URL(c.req.url).origin;
  const headers = new Headers();

  // Collect all parameters in a single pass
  const { pathname, searchParams } = step.parameters.reduce(
    (acc, param) => {
      const value = String(params.parameters[param.name]);
      switch (param.in) {
        case "path":
          acc.pathname = acc.pathname.replace(`{${param.name}}`, value);
          break;
        case "query":
          acc.searchParams += `${acc.searchParams ? "&" : ""}${encodeURIComponent(param.name)}=${encodeURIComponent(value)}`;
          break;
        case "header":
          headers.append(param.name, value);
          break;
      }
      return acc;
    },
    { pathname: params.path, searchParams: "" },
  );

  // Construct URL with all parameters
  const url = new URL(
    pathname + (searchParams ? `?${searchParams}` : ""),
    baseUrl,
  );

  if (params.body) {
    headers.append("Content-Type", "application/json");
  }

  const request = new Request(url, {
    method: params.method.toUpperCase(),
    headers,
    body: params.body ? JSON.stringify(params.body) : undefined,
  });

  const response = await userApp.request(
    request,
    {},
    userEnv,
    userExecutionCtx,
  );

  const contentType = response.headers.get("content-type");
  const responseBody = contentType?.includes("application/json")
    ? await response.json()
    : (await response.text()) || null;

  return {
    statusCode: response.status,
    body: responseBody,
  };
}
