import { type Env } from "hono";
import type { FiberplaneAppType } from "../../types.js";
export default function createRunnerRoute<E extends Env>(apiKey: string): import("hono/hono-base").HonoBase<E & FiberplaneAppType<E>, {
    "/:workflowId": {
        $post: {
            input: {
                param: {
                    workflowId: string;
                };
            };
            output: {
                error: string;
            };
            outputFormat: "json";
            status: 400;
        } | {
            input: {
                param: {
                    workflowId: string;
                };
            };
            output: never;
            outputFormat: "json";
            status: import("hono/utils/http-status").ContentfulStatusCode;
        };
    };
}, "/">;
