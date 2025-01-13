import type { Env, Hono, MiddlewareHandler } from "hono";
import type { EmbeddedOptions } from "./types.js";
export declare const createFiberplane: <E extends Env & {
    Variables: {
        userApp: Hono<E>;
        userEnv: Env;
    };
}>(options: EmbeddedOptions<E>) => MiddlewareHandler;
