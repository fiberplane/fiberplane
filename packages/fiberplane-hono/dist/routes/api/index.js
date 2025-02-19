import { Hono } from "hono";
import createAssistantApiRoute from "./assistant.js";
import createReportsApiRoute from "./reports.js";
import createTokensApiRoute from "./tokens.js";
import createTracesApiRoute from "./traces.js";
import createWorkflowsApiRoute from "./workflows.js";
export default function createApiRoutes(apiKey, fpxEndpoint) {
    const app = new Hono();
    app.route("/workflows", createWorkflowsApiRoute(apiKey));
    app.route("/tokens", createTokensApiRoute(apiKey));
    app.route("/traces", createTracesApiRoute(fpxEndpoint));
    app.route("/reports", createReportsApiRoute(apiKey));
    app.route("/assistant", createAssistantApiRoute(apiKey));
    return app;
}
