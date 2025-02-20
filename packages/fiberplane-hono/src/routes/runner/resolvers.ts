import jsonpointer from "jsonpointer";
import { JSONPath } from "jsonpath-plus";
// NOTE: most of this code is vibe-coded and haven't been rigurously tested
// unit tests are green but hey ho
import type { Step, StepParameter } from "../../schemas/workflows.js";
import type { Workflow } from "../../schemas/workflows.js";

export interface WorkflowContext {
  inputs: Record<string, unknown>;
  steps: Record<
    string,
    {
      inputs?: Record<string, unknown>;
      outputs?: Record<string, unknown>;
    }
  >;
}

export interface HttpRequestParams {
  path: string;
  method: string;
  parameters: Record<string, string>;
  body?: unknown;
}

function resolvePathAndMethod(
  step: Step,
): Pick<HttpRequestParams, "path" | "method"> {
  return {
    path: step.operation.path,
    method: step.operation.method,
  };
}

function resolveParameters(
  parameters: StepParameter[],
  context: WorkflowContext,
): Record<string, string> {
  return parameters.reduce(
    (acc, param) => {
      acc[param.name] = String(resolveReference(param.value, context));
      return acc;
    },
    {} as Record<string, string>,
  );
}

function resolveBody(
  requestBody: Step["requestBody"],
  context: WorkflowContext,
): unknown | undefined {
  if (!requestBody) {
    return undefined;
  }

  const { payload } = requestBody;

  // Handle string payload (runtime expression)
  if (typeof payload === "string") {
    return resolveReference(payload, context);
  }

  // Handle object payload
  if (typeof payload === "object") {
    const resolvedBody = Object.entries(payload).reduce<
      Record<string, unknown>
    >((acc, [key, value]) => {
      acc[key] =
        typeof value === "string" && value.startsWith("$")
          ? resolveReference(value, context)
          : value;
      return acc;
    }, {});

    // Apply replacements if any
    // for (const { target, value } of replacements) {
    //   if (!target || !value) {
    //     continue;
    //   }

    //   const parts = target.split("/").filter(Boolean);
    //   let current = resolvedBody;

    //   // Navigate to the target location
    //   for (let i = 0; i < parts.length - 1; i++) {
    //     const part = parts[i];
    //     current[part] = current[part] || {};
    //     current = current[part] as Record<string, unknown>;
    //   }

    //   // Apply the replacement
    //   const lastPart = parts[parts.length - 1];
    //   current[lastPart] = value;
    // }

    return resolvedBody;
  }

  return undefined;
}

export async function resolveStepParams(
  step: Step,
  context: WorkflowContext,
): Promise<HttpRequestParams> {
  const { path, method } = resolvePathAndMethod(step);
  const parameters = resolveParameters(step.parameters, context);
  const body = resolveBody(step.requestBody, context);

  return {
    path,
    method,
    parameters,
    ...(body ? { body } : {}),
  };
}

export function resolveOutputs(
  workflow: Workflow,
  context: WorkflowContext,
): Record<string, unknown> {
  return workflow.outputs.reduce<Record<string, unknown>>((acc, output) => {
    acc[output.key] = resolveReference(output.value, context);
    return acc;
  }, {});
}

export function resolveReference(
  value: string,
  context:
    | WorkflowContext
    | { response: { statusCode: number; body: unknown } },
): unknown {
  // If not an expression, return as is
  if (!value.startsWith("$") && !value.includes("{$")) {
    return value;
  }

  // Handle template expressions like "Bearer {$steps.authenticate.outputs.token}"
  if (value.includes("{$")) {
    return value.replace(/\{([^}]+)\}/g, (_, expr) => {
      const resolved = resolveReference(expr, context);
      return resolved === undefined ? "" : String(resolved);
    });
  }

  // Split into JSONPath and JSON Pointer parts
  const [jsonPath, jsonPointerPath] = value.split("#");

  // For response references, we need to use a different context
  if (jsonPath.startsWith("$response") && "response" in context) {
    const path = jsonPath.replace("$response", "$");
    const result = JSONPath({
      path,
      json: context.response,
      resultType: "value",
    })[0];

    if (jsonPointerPath && result) {
      return jsonpointer.get(result, jsonPointerPath.startsWith("/") ? jsonPointerPath : `/${jsonPointerPath}`);
    }
    return result;
  }

  // Transform the path into proper JSONPath format
  // Example: $inputs.name -> $.inputs.name
  // Example: $steps.listItems.outputs.items[1].id -> $.steps.listItems.outputs.items[1].id
  const transformedPath = jsonPath.replace(/^\$/, "$.");

  const result = JSONPath({
    path: transformedPath,
    json: context,
    resultType: "value",
  })[0];

  if (jsonPointerPath && result) {
    return jsonpointer.get(result, jsonPointerPath.startsWith("/") ? jsonPointerPath : `/${jsonPointerPath}`);
  }

  return result;
}

export function resolveStepOutputs(
  step: Step,
  response: { statusCode: number; body: unknown },
): Record<string, unknown> | undefined {
  if (!step.outputs?.length) {
    return undefined;
  }

  return step.outputs.reduce<Record<string, unknown>>((acc, output) => {
    acc[output.key] = resolveReference(output.value, { response });
    return acc;
  }, {});
}
