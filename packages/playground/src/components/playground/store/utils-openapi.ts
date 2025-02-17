import {
  type SupportedMediaTypeObject,
  type SupportedParameterObject,
  type SupportedSchemaObject,
  isSupportedParameterObject,
  isSupportedSchemaObject,
} from "@/lib/isOpenApi";
import { z } from "zod";
import { enforceTerminalDraftParameter } from "../KeyValueForm";
import { createKeyValueElement } from "../KeyValueForm/data";
import type { ApiRoute } from "../types";
import type { KeyValueElement, PlaygroundBody } from "./types";

/**
 * Filters query parameters to only include those that are either enabled or have a value
 * Intent is that when you change routes, we auto-clear anything dangling from previous openapi specs
 *
 * @param currentQueryParams - Array of key-value parameters to filter
 * @returns Filtered array of parameters with a terminal draft parameter
 */
export function filterDisabledEmptyQueryParams(
  currentQueryParams: KeyValueElement[],
) {
  return enforceTerminalDraftParameter(
    currentQueryParams.filter((param) => param.enabled || !!param.data.value),
  );
}

/**
 * Extracts and merges query parameters from an OpenAPI specification with current (key value) elements
 *
 * @param currentElements - Current array of key-value elements
 * @param route - Route object containing OpenAPI specification and path
 * @returns Merged array of parameters with a terminal draft parameter
 */
export function extractQueryParamsFromOpenApiDefinition(
  currentElements: KeyValueElement[],
  route: ApiRoute,
) {
  const parameters = [
    ...(route.parameters ?? []),
    ...(route.operation.parameters || []),
  ];

  // Extract query parameters from OpenAPI spec
  const specQueryParams =
    (parameters?.filter(
      (param) => isSupportedParameterObject(param) && param.in === "query",
    ) as Array<SupportedParameterObject>) ?? [];

  // Convert OpenAPI params to KeyValueElement format
  const openApiQueryParams: Array<KeyValueElement> = specQueryParams.map(
    (parameter) => {
      return createKeyValueElement(parameter.name, undefined, parameter);
    },
  );

  // Merge with existing parameters, preferring existing values
  const mergedParams = openApiQueryParams.map((openApiParam) => {
    const existingParam = currentElements.find(
      (p) => p.key === openApiParam.key,
    );
    return existingParam ?? openApiParam;
  });

  // Add any existing parameters that weren't in the OpenAPI spec
  const additionalParams = currentElements.filter(
    (param) => !openApiQueryParams.some((p) => p.key === param.key),
  );

  return enforceTerminalDraftParameter([...mergedParams, ...additionalParams]);
}

// Declare the type first since we're going to have a recursive reference
// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type JsonSchemaPropertyType = z.ZodType<any>;

// Then define the schema
const JsonSchemaProperty: JsonSchemaPropertyType = z.object({
  type: z.string(),
  example: z.any().optional(),
  properties: z.record(z.lazy(() => JsonSchemaProperty)).optional(),
  required: z.array(z.string()).optional(),
});

const SUPPORTED_FORM_DATA_SCHEMA_TYPES = [
  "string",
  "number",
  "integer",
  "boolean",
] as const;

type SupportedFormDataSchemaTypes =
  (typeof SUPPORTED_FORM_DATA_SCHEMA_TYPES)[number];

export function extractFormDataFromOpenApiDefinition(
  mediaType: SupportedMediaTypeObject,
): PlaygroundBody {
  const values: Array<KeyValueElement> = [];
  if (mediaType.schema && isSupportedSchemaObject(mediaType.schema)) {
    const schema = mediaType.schema;
    if (schema.type === "object") {
      if (schema.additionalProperties) {
        console.warn(
          "Additional properties detected, but aren't handled currently",
        );
      }

      const { properties = {} } = schema;
      for (const key of Object.keys(properties)) {
        const propertySchema = properties[key];
        if (!isSupportedSchemaObject(propertySchema)) {
          continue;
        }

        // Const supported types
        const propertySchemaType = propertySchema.type || "";
        if (
          !Array.isArray(propertySchemaType) &&
          SUPPORTED_FORM_DATA_SCHEMA_TYPES.includes(
            propertySchemaType as SupportedFormDataSchemaTypes,
          )
        ) {
          const parameter = {
            name: key,
            description: propertySchema.description,
            in: "formData",
            schema: {
              type: propertySchemaType as SupportedFormDataSchemaTypes,
              description: propertySchema.description,
              format: propertySchema.format,
              default: propertySchema.default,
              // Numeric validation
              minimum: propertySchema.minimum,
              maximum: propertySchema.maximum,
              exclusiveMinimum: !!propertySchema.exclusiveMinimum,
              exclusiveMaximum: !!propertySchema.exclusiveMaximum,
              multipleOf: propertySchema.multipleOf,
              // String validation
              pattern: propertySchema.pattern,
              minLength: propertySchema.minLength,
              maxLength: propertySchema.maxLength,
              // Enums
              enum: propertySchema.enum,
              // Metadata
              title: propertySchema.title,
              deprecated: propertySchema.deprecated,
              readOnly: propertySchema.readOnly,
              writeOnly: propertySchema.writeOnly,
              example: propertySchema.example,
            },
          };

          const newParameter = createKeyValueElement(key, undefined, parameter);
          newParameter.enabled = !!schema.required?.includes(key);
          values.push(newParameter);
        }
      }
    }
  }

  return {
    type: "form-data",
    isMultipart: true,
    value: enforceTerminalDraftParameter(values),
  };
}

/**
 * Extracts a sample JSON body from OpenAPI specification if the current body is empty
 *
 * @param currentBody - Current request body content
 * @param route - Route object containing OpenAPI specification
 * @returns Sample JSON body string or the current body if no valid schema found
 */
export function extractJsonBodyFromOpenApiDefinition(
  currentBody: PlaygroundBody,
  mediaType: SupportedMediaTypeObject,
): PlaygroundBody {
  const schema = mediaType.schema;
  if (!schema || !isSupportedSchemaObject(schema)) {
    return currentBody;
  }

  try {
    const sampleBody = generateSampleFromSchema(schema);
    return {
      type: "json",
      value: JSON.stringify(sampleBody, null, 2),
    };
  } catch (error) {
    console.warn("Failed to generate sample body", error);
    return currentBody;
  }
}

function generateSampleFromSchema(
  schema: SupportedSchemaObject,
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
): any {
  if (schema.example !== undefined) {
    return schema.example;
  }

  if (schema.type === "object" && schema.properties) {
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    const result: Record<string, any> = {};
    for (const [key, prop] of Object.entries(schema.properties)) {
      result[key] = generateSampleFromSchema(prop);
    }
    return result;
  }

  // Default values for different types
  switch (schema.type) {
    case "string":
      return "string";
    case "number":
    case "integer":
      return 0;
    case "boolean":
      return false;
    case "array":
      return [];
    default:
      return null;
  }
}
