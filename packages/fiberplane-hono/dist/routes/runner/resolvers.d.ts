import type { Step } from "../../schemas/workflows.js";
import type { Workflow } from "../../schemas/workflows.js";
export interface WorkflowContext {
    inputs: Record<string, unknown>;
    steps: Record<string, {
        inputs?: Record<string, unknown>;
        outputs?: Record<string, unknown>;
    }>;
}
export interface HttpRequestParams {
    path: string;
    method: string;
    parameters: Record<string, string>;
    body?: unknown;
}
export declare function resolveStepParams(step: Step, context: WorkflowContext): Promise<HttpRequestParams>;
export declare function resolveOutputs(workflow: Workflow, context: WorkflowContext): Record<string, unknown>;
export declare function resolveReference(value: string, context: WorkflowContext | {
    response: {
        statusCode: number;
        body: unknown;
    };
}): unknown;
export declare function resolveStepOutputs(step: Step, response: {
    statusCode: number;
    body: unknown;
}): Record<string, unknown> | undefined;
