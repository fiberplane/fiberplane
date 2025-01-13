import { type Env, Hono } from "hono";
import type { FiberplaneAppType } from "../../types.js";
export default function createApiRoutes<E extends Env>(apiKey: string, fpxEndpoint?: string): Hono<E & FiberplaneAppType<E>, import("hono/types").BlankSchema, "/">;
