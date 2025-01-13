import { Hono } from "hono";
import { logIfDebug } from "../../debug.js";
export default function createTracesApiRoute(fpxEndpoint) {
    const app = new Hono();
    app.get("/", async (c) => {
        logIfDebug(c, "[traces]", "- GET / -", "Proxying request to fiberplane api");
        if (!fpxEndpoint) {
            logIfDebug(c, "[traces]", "- GET / -", "fpx endpoint undefined, returning early");
            return c.json({ error: "Tracing is not enabled" }, 500);
        }
        try {
            const fpxBaseUrl = new URL(fpxEndpoint).origin;
            const requestUrl = `${fpxBaseUrl}/v1/traces`;
            const response = await fetch(requestUrl, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });
            logIfDebug(c, "[traces]", "- GET / -", "API response from traces endpoint:", response);
            const data = (await response.json());
            return c.json(data);
        }
        catch (error) {
            console.error("Failed to fetch traces:", error);
            return c.json({ error: "Failed to fetch traces" }, 500);
        }
    });
    app.get("/:traceId/spans", async (c) => {
        logIfDebug(c, "[traces]", "- GET /:traceId/spans -", "Proxying request to fiberplane api");
        if (!fpxEndpoint) {
            return c.json({ error: "Tracing is not enabled" }, 500);
        }
        try {
            const fpxBaseUrl = new URL(fpxEndpoint).origin;
            const traceId = c.req.param("traceId");
            const requestUrl = `${fpxBaseUrl}/v1/traces/${traceId}/spans`;
            const response = await fetch(requestUrl, {
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
            });
            logIfDebug(c, "[traces]", "- GET /:traceId/spans -", "API response from spans endpoint:", response);
            const data = (await response.json());
            return c.json(data);
        }
        catch (error) {
            console.error("Failed to fetch spans:", error);
            return c.json({ error: "Failed to fetch spans" }, 500);
        }
    });
    return app;
}
