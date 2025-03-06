import { z } from "zod";

export const ExecutionErrorSchema = z.object({
  type: z.literal("EXECUTION_ERROR"),
  message: z.string(),
  details: z.object({
    stepId: z.string(),
    inputs: z.record(z.unknown()),
    // body: z.string().optional(),
    response: z.string().optional(),
    responseStatus: z.number().optional(),
  }),
});

export const ValidationDetailSchema = z.object({
  key: z.string(),
  message: z.string(),
  code: z.string(),
});

export type ValidationDetail = z.infer<typeof ValidationDetailSchema>;

export const ValidationErrorSchema = z.object({
  type: z.literal("VALIDATION_ERROR"),
  message: z.string(),
  details: z.array(ValidationDetailSchema),
});

export type ValidationError = z.infer<typeof ValidationErrorSchema>;

export type ExecutionError = z.infer<typeof ExecutionErrorSchema>;

export const FpApiErrorDetailsSchema = z.discriminatedUnion("type", [
  ExecutionErrorSchema,
  ValidationErrorSchema,
]);

export type FpApiErrorDetails = z.infer<typeof FpApiErrorDetailsSchema>;

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
    console.log("error in the handle error", _error);
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
