// TODO: ideally we'd replace this with a zod validator but cheaper and simpler
// to use a basic json schema validator for now
import { sValidator } from "@hono/standard-validator";
import { type Env, Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { Draft2019 } from "json-schema-library";
import { z } from "zod";
import { InputSchema, type Step, type Workflow } from "../../schemas/workflows";
import type {
  ExecutionErrorInformation,
  FiberplaneAppType,
  ValidationErrorInformation,
} from "../../types";
import { getContext } from "../../utils";
import {
  type HttpRequestParams,
  type WorkflowContext,
  resolveOutputs,
  resolvePathAndMethod,
  resolveStepOutputs,
  resolveStepParams,
} from "./resolvers";
import { getWorkflowById } from "./utils";

export type ErrorDetails = Omit<
  ExecutionErrorInformation["payload"],
  "body"
> & {
  body?: unknown;
};

class WorkflowError extends HTTPException {
  constructor(
    status: number,
    message: string,
    public readonly details: ErrorDetails,
    public readonly cause?: unknown,
  ) {
    super(status as 400 | 401 | 403 | 404 | 500, {
      message,
      cause,
    });
  }

  toResponse(): ExecutionErrorInformation {
    const { body, ...details } = this.details;

    return {
      type: "EXECUTION_ERROR",
      message: this.message,
      payload: details,
    };
  }
}

function serialize(content: unknown) {
  if (typeof content === "string") {
    return content;
  }

  if (content === undefined) {
    return undefined;
  }

  return JSON.stringify(content);
}

const BaseJsonErrorSchema = z.object({
  type: z.literal("error"),
  name: z.string(),
  message: z.string(),
});

const RequiredPropertyErrorDataSchema = z.object({
  key: z.string(),
  pointer: z.string(),
  schema: InputSchema,
  value: z.any(),
});

const TypeErrorDataSchema = z.object({
  value: z.any(),
  pointer: z.string(),
  expected: z.string(),
  received: z.string(),
  schema: InputSchema,
});

const RequiredPropertyErrorSchema = BaseJsonErrorSchema.extend({
  code: z.literal("required-property-error"),
  data: RequiredPropertyErrorDataSchema,
});

const TypeErrorSchema = BaseJsonErrorSchema.extend({
  code: z.literal("type-error"),
  data: TypeErrorDataSchema,
});

const SupportedValidationErrorSchema = z.discriminatedUnion("code", [
  RequiredPropertyErrorSchema,
  TypeErrorSchema,
]);

type SupportedValidationError = z.infer<typeof SupportedValidationErrorSchema>;

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

      const inputs = workflow.inputs;
      if (inputs.type === "object" && inputs.properties) {
        inputs.properties = Object.fromEntries(
          Object.entries(inputs.properties).map(([key, value]) => {
            return [key, { ...value, id: key }];
          }),
        );
      }
      const draft = new Draft2019(inputs);
      const body = await c.req.json();

      const errors = draft.validate(body);
      if (errors.length) {
        const details = errors
          .map((item) => {
            const parsedResult = SupportedValidationErrorSchema.safeParse(item);
            if (parsedResult.success) {
              return parsedResult.data;
            }
            return null;
          })
          .filter((item) => item !== null)
          .map((item) => {
            if (item.code === "required-property-error") {
              return {
                key: item.data.key,
                message: item.message,
                code: item.code,
              };
            }

            return {
              code: item.code,
              key: item.data.pointer,
              message: item.message,
            };
          });

        const response: ValidationErrorInformation = {
          type: "VALIDATION_ERROR",
          message: "validation failed",
          payload: details,
        };
        return c.json(response, 400);
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
      const stepParameters = await resolveStepParams(step, workflowContext);
      const c = getContext();
      const baseUrl = new URL(c.req.url).origin;
      const request = createRequest(step, stepParameters, baseUrl);
      const response = await executeRequest(request);
      if (response.statusCode >= 400) {
        const request = createRequest(step, stepParameters, baseUrl);
        const errorDetails: ErrorDetails = {
          stepId: step.stepId,
          parameters: stepParameters.parameters,
          request: {
            url: request.url,
            method: request.method,
            headers: Object.fromEntries(request.headers.entries()),
            body: stepParameters.body
              ? serialize(stepParameters.body)
              : undefined,
          },
          response: {
            status: response.statusCode,
            body: serialize(response.body),
          },
          // body: stepParameters.body ?? undefined,
          // responseStatus: response.statusCode,
          // response: serialize(response.body),
        };

        throw new WorkflowError(
          response.statusCode,
          "Workflow failed",
          errorDetails,
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

      throw new WorkflowError(500, "Unknown step execution error", {
        stepId: step.stepId,
      });
    }
  }

  return resolveOutputs(workflow, workflowContext);
}

async function executeRequest<E extends Env>(
  // step: Step,
  // params: HttpRequestParams,
  request: Request,
): Promise<{ statusCode: number; body: unknown }> {
  const c = getContext<E & FiberplaneAppType<E>>();
  const userApp = c.get("userApp");
  const userEnv = c.get("userEnv");
  const userExecutionCtx = c.get("userExecutionCtx");
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

function createRequest(step: Step, params: HttpRequestParams, origin: string) {
  const baseUrl = new URL(origin);
  const headers = new Headers();

  const { method, path: uri } = resolvePathAndMethod(step);
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
    { pathname: uri, searchParams: "" },
  );

  // Construct URL with all parameters
  const url = new URL(
    pathname + (searchParams ? `?${searchParams}` : ""),
    baseUrl,
  );

  if (params.body) {
    headers.append("Content-Type", "application/json");
  }

  return new Request(url, {
    method: method.toUpperCase(),
    headers,
    body: params.body ? JSON.stringify(params.body) : undefined,
  });
}
