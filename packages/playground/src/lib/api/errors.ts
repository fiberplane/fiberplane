import { z } from "zod";

// Define the schema for the error payload returned by the API
// when the execution of a step fails (during execution)
export const ExecutionErrorSchema = z.object({
  type: z.literal("EXECUTION_ERROR"),
  message: z.string(),
  payload: z.object({
    stepId: z.string(),
    parameters: z.record(z.unknown()).optional(),
    request: z
      .object({
        url: z.string(),
        method: z.string(),
        headers: z.record(z.string()),
        body: z.string().optional(),
      })
      .optional(),
    response: z
      .object({
        status: z.number(),
        body: z.string().optional(),
        headers: z.record(z.string()),
      })
      .optional(),
  }),
});

export const ValidationDetailSchema = z.object({
  key: z.string(),
  message: z.string(),
  code: z.string(),
});

export type ValidationDetail = z.infer<typeof ValidationDetailSchema>;

// Define the schema for the error payload returned by the API
// when the validation of the workflow parameters fails
export const ValidationErrorSchema = z.object({
  type: z.literal("VALIDATION_ERROR"),
  message: z.string(),
  payload: z.array(ValidationDetailSchema),
});

export type ValidationError = z.infer<typeof ValidationErrorSchema>;
export type ExecutionError = z.infer<typeof ExecutionErrorSchema>;

export const FpApiErrorDetailsSchema = z.discriminatedUnion("type", [
  ExecutionErrorSchema,
  ValidationErrorSchema,
]);

export type FpApiErrorDetails = z.infer<typeof FpApiErrorDetailsSchema>;

// FpApiError is a custom error class that can contain the FpApiErrorDetails
// returned by the API
export class FpApiError extends Error {
  statusCode?: number;
  details?: FpApiErrorDetails;

  constructor(
    message: string,
    statusCode?: number,
    details?: FpApiErrorDetails,
  ) {
    super(message);
    this.name = "FpApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export class FetchOpenApiSpecError extends Error {
  path?: string;
  statusCode?: number;
  details?: string;

  constructor(
    message: string,
    path?: string,
    statusCode?: number,
    details?: string,
  ) {
    super(message);
    this.name = "FetchOpenApiSpecError";
    this.path = path;
    this.statusCode = statusCode;
    this.details = details;
  }
}
/**
 * Parses an error response from the API into an `FpApiError`.
 */
export async function parseErrorResponse(
  response: Response,
): Promise<FpApiError> {
  const contentType = response.headers.get("content-type");
  let message = `Request failed with status ${response.status}`;
  let details: FpApiErrorDetails | undefined;

  try {
    if (contentType?.includes("application/json")) {
      const error = await response.json();
      message = error.message || message;
      details = FpApiErrorDetailsSchema.parse(error);
    } else if (contentType?.includes("text/")) {
      message = await response.text();
    }
  } catch (_error) {
    console.warn("Error in parsing the error response", _error);
    // If parsing fails, retain the default message
  }

  return new FpApiError(message, response.status, details);
}

export function isFeatureDisabledError(error: unknown) {
  return isFpApiError(error) && error.statusCode === 402;
}

export function isFpApiError(error: unknown): error is FpApiError {
  return error instanceof FpApiError;
}

export function isFetchOpenApiSpecError(error: unknown) {
  return error instanceof FetchOpenApiSpecError;
}

export function isFailedToFetchError(error: unknown) {
  return error instanceof Error && error.message === "Failed to fetch";
}
