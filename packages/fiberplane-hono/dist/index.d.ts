import { createOpenAPISpec } from "./create-open-api/index.js";
import { createFiberplane } from "./middleware.js";
export { createFiberplane, createOpenAPISpec };
/**
 * @deprecated Use createFiberplane() instead. This alias will be removed in a future version.
 */
export declare const createMiddleware: <E extends import("hono").Env & {
    Variables: {
        userApp: import("hono").Hono<E>;
        userEnv: import("hono").Env;
    };
}>(options: import("./types.js").EmbeddedOptions<E>) => import("hono").MiddlewareHandler;
export { FpService } from "./services/index.js";
