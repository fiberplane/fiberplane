import type { Env } from "hono";
import { type ZodError } from "zod";
import type { Workflow } from "../../schemas/workflows.js";
export declare function getWorkflowById<E extends Env>(workflowId: string, apiKey: string): Promise<{
    data: Workflow;
}>;
/**
 * Formats a ZodError into a readable string for debugging purposes.
 * Includes detailed information about validation errors including:
 * - Path to the error in the object
 * - Error code and message
 * - Validation details
 * - Fatal flag if present
 * - Union validation errors if present
 */
export declare function formatZodError(error: ZodError): string;
