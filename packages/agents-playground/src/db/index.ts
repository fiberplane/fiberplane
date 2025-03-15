import { drizzle } from "drizzle-orm/d1";
import type { Hono } from "hono";
import * as schema from "./schema";

// Define environment type for Hono
type Bindings = {
	DB: D1Database;
};

// Create a DB client factory function
export const createDb = (c: { env: Bindings }) => drizzle(c.env.DB, { schema });

// Type for your Hono app with DB
export type AppType = Hono<{ Bindings: Bindings }>;
