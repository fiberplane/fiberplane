import { type Env, Hono } from "hono";
import type { FiberplaneAppType } from "../../types.js";
export default function createTracesApiRoute<E extends Env>(fpxEndpoint?: string): Hono<E & FiberplaneAppType<E>, import("hono/types").BlankSchema, "/">;
