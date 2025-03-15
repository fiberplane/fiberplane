import { Hono } from "hono";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getDurableObjectsFromConfig } from "./utils";

const app = new Hono();

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (c) => {
	// Get all the durable objects

	const configPath = path.join(__dirname, "..", "..", "wrangler.toml");
	const result = getDurableObjectsFromConfig(configPath);

	console.log("result", result);

	return c.json(result);
});

export default app;
