import { type Env, Hono } from "hono";
import type { FiberplaneAppType } from "../../types.js";
export default function createAssistantApiRoute<E extends Env>(apiKey: string): Hono<E & FiberplaneAppType<E>, import("hono/types").BlankSchema, "/">;
