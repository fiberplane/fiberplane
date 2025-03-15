import { Hono } from "hono";
import { agentsMiddleware } from "hono-agents";
export { Chat } from "./Agent";

// Basic setup
const app = new Hono();
app.use("*", agentsMiddleware());

export default app;
