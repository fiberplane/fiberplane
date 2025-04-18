import {
  type SupportedOperationObject,
  type SupportedParameterObject,
  type SupportedSchemaObject,
  isSupportedParameterObject,
  isSupportedRequestBodyObject,
  isSupportedSchemaObject,
} from "@/lib/isOpenApi";
import type { KeyValueElement } from "./types";
import { extractPathParameterKeys } from "./utils";

type OutputData = {
  value: string;
  parameter: SupportedParameterObject;
};
type FakeDataOutput = {
  queryParams: Record<string, OutputData>;
  headers: Record<string, OutputData>;
  pathParams: Record<string, OutputData>;
  body: unknown;
};

function generateSmartFakeValue(
  schema: SupportedSchemaObject,
  fieldName: string,
): unknown {
  // Handle array type
  if (
    schema.type === "array" &&
    schema.items &&
    isSupportedSchemaObject(schema.items)
  ) {
    return [generateSmartFakeValue(schema.items, `${fieldName}Item`)];
  }

  // Handle object type
  if (schema.type === "object" && schema.properties) {
    const obj: Record<string, unknown> = {};
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      obj[key] = generateSmartFakeValue(propSchema, key);
    }
    return obj;
  }

  // Use example if provided
  if (schema.example !== undefined) {
    return schema.example;
  }

  // Smart heuristics based on field name and type
  const nameLower = fieldName.toLowerCase();

  if (schema.enum) {
    return schema.enum[0];
  }

  switch (schema.type) {
    case "string": {
      // Email heuristics
      if (nameLower.includes("email")) {
        return "user@example.com";
      }
      // UUID/ID heuristics
      if (nameLower.includes("uuid") || nameLower.includes("id")) {
        return "123e4567-e89b-12d3-a456-426614174000";
      }
      // Name heuristics
      if (nameLower.includes("name")) {
        return nameLower.includes("first")
          ? "John"
          : nameLower.includes("last")
            ? "Doe"
            : "John Doe";
      }
      if (nameLower.includes("date") || nameLower.includes("time")) {
        return new Date().toISOString();
      }
      return "test_string";
    }
    case "number":
    case "integer": {
      if (nameLower.includes("year")) {
        return new Date().getFullYear();
      }
      if (nameLower.includes("id")) {
        return Math.floor(Math.random() * 1000) + 1;
      }
      return 42;
    }
    case "boolean":
      return true;
    default:
      return null;
  }
}

export function generateFakeData(
  routeSpec: SupportedOperationObject,
  path: string,
): FakeDataOutput {
  const output: FakeDataOutput = {
    queryParams: {},
    headers: {},
    pathParams: {},
    body: undefined,
  };

  // Handle path parameters
  const pathParamNames = extractPathParameterKeys(path);
  const pathParamSpecs =
    routeSpec.parameters?.filter(
      (p) => isSupportedParameterObject(p) && p.in === "path",
    ) || [];

  // Map path parameters to their specs if available
  for (const paramName of pathParamNames) {
    const paramSpec = pathParamSpecs.find(
      (p) => isSupportedParameterObject(p) && p.name === paramName,
    ) as SupportedParameterObject | undefined;
    if (paramSpec?.schema && isSupportedSchemaObject(paramSpec.schema)) {
      output.pathParams[paramName] = {
        value: String(generateSmartFakeValue(paramSpec.schema, paramName)),
        parameter: paramSpec,
      };
    } else {
      // Fallback if no spec is found - generate based on name
      output.pathParams[paramName] = {
        value: String(generateSmartFakeValue({ type: "string" }, paramName)),
        parameter: paramSpec ?? {
          name: paramName,
          in: "path",
        },
      };
    }
  }

  // Handle query and header parameters
  if (routeSpec.parameters) {
    const parameters = routeSpec.parameters.filter(
      isSupportedParameterObject,
    ) as Array<SupportedParameterObject>;
    for (const param of parameters) {
      const fakeValue = generateSmartFakeValue(
        param.schema && isSupportedSchemaObject(param.schema)
          ? param.schema
          : {},
        isSupportedParameterObject(param) ? param.name : "",
      );

      if (param.in === "query") {
        output.queryParams[param.name] = {
          value: String(fakeValue),
          parameter: param,
        };
      } else if (param.in === "header") {
        output.headers[param.name] = {
          value: String(fakeValue),
          parameter: param,
        };
      }
    }
  }

  // Handle request body
  if (
    routeSpec.requestBody &&
    isSupportedRequestBodyObject(routeSpec.requestBody) &&
    routeSpec.requestBody.content &&
    "application/json" in routeSpec.requestBody.content
  ) {
    const bodySchema = routeSpec.requestBody.content["application/json"].schema;
    if (bodySchema && isSupportedSchemaObject(bodySchema)) {
      output.body = generateSmartFakeValue(bodySchema, "root");
    }
  }

  return output;
}

export function transformToFormParams(record: Record<string, OutputData>) {
  return Object.entries(record).map(
    ([key, data]): KeyValueElement => ({
      key,
      id: crypto.randomUUID(),
      data: {
        type: "string" as const,
        value: data.value,
      },
      enabled: true,
      parameter: data.parameter,
    }),
  );
}

export function transformToFormBody(body: unknown) {
  if (body === undefined) {
    return { type: "json" as const, value: undefined };
  }
  return {
    type: "json" as const,
    value: JSON.stringify(body, null, 2),
  };
}
