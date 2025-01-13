import { type Env, Hono } from "hono";
import type { FiberplaneAppType, SanitizedEmbeddedOptions } from "../types.js";
export default function createPlayground<E extends Env>(sanitizedOptions: SanitizedEmbeddedOptions<E>): Hono<E & FiberplaneAppType<E>, import("hono/types").BlankSchema, "/">;
