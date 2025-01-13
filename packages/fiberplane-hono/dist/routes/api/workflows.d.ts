import { type Env, Hono } from "hono";
import type { FiberplaneAppType } from "../../types.js";
export default function createWorkflowsApiRoute<E extends Env>(apiKey: string): Hono<E & FiberplaneAppType<E>, import("hono/types").BlankSchema, "/">;
