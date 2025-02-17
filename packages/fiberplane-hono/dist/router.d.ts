import { type Env, Hono } from "hono";
import type { FiberplaneAppType, ResolvedEmbeddedOptions } from "./types.js";
export declare function createRouter<E extends Env>(options: ResolvedEmbeddedOptions<E>): Hono<E & FiberplaneAppType<E>>;
