import { Hono } from "hono";
import { resolver, validator } from "hono-openapi/zod";
import { openAPISpecs, describeRoute } from "hono-openapi";
import { nanoid } from "nanoid";
import {
	ApiSuccessResponseSchema,
	DeployStatusRequestSchema,
	DeployStatusResponseSchema,
	ProjectCreateRequest,
	ProjectCreateResponse,
	ProjectDeployRequest,
	ProjectDeployResponse,
} from "./schemas";
import { convertToKebabCase } from "@/utils";

import { DeployWorkflow } from "@/deploy";
import type { AppEnv } from "@/types";
import { commonErrorResponses } from "./utils/errors";
import { createFiberplane } from "@fiberplane/hono";

const app = new Hono<AppEnv>().basePath("/api");

app.post(
	"/project/create",
	describeRoute({
		description: "Create a new project",
		tags: ["Project"],
		responses: {
			200: {
				description: "Project created successfully",
				content: {
					"application/json": {
						schema: resolver(ApiSuccessResponseSchema(ProjectCreateResponse)),
					},
				},
			},
			...commonErrorResponses,
		},
		validateResponse: true,
	}),
	validator("json", ProjectCreateRequest),
	async (c) => {
		const { files, name } = c.req.valid("json");

		const projectId = `${convertToKebabCase(name)}-${nanoid(8)}`;

		await c.env.projects.put(projectId, JSON.stringify(files));

		return c.json({ projectId });
	},
);

// Deploy endpoint
app.post(
	"/project/:projectId/deploy",
	describeRoute({
		description: "Bundle and deploy code to Cloudflare",
		tags: ["Project"],
		responses: {
			200: {
				description: "Deploy workflow started successfully",
				content: {
					"application/json": {
						schema: resolver(ApiSuccessResponseSchema(ProjectDeployResponse)),
					},
				},
			},
			...commonErrorResponses,
		},
	}),
	validator("param", ProjectDeployRequest),
	async (c) => {
		console.log("got deploy request");
		const { projectId } = c.req.valid("param");
		console.log("projectId", projectId);

		const workflowInstance = await c.env.DEPLOY_WORKFLOW.create({
			params: { projectId },
		});

		const { status } = await workflowInstance.status();

		return c.json({
			deployId: workflowInstance.id,
			status,
		});
	},
);

app.get(
	"/deploy/:deployId/status",
	describeRoute({
		description: "Get the status of a deploy workflow",
		tags: ["Deploy"],
		responses: {
			200: {
				description: "Deploy workflow status",
				content: {
					"application/json": {
						schema: resolver(DeployStatusResponseSchema),
					},
				},
			},
			...commonErrorResponses,
		},
	}),
	validator("param", DeployStatusRequestSchema),
	async (c) => {
		const { deployId } = c.req.valid("param");

		const workflowInstance = await c.env.DEPLOY_WORKFLOW.get(deployId);

		return c.json({
			status: await workflowInstance.status(),
		});
	},
);

// OpenAPI documentation
app.get(
	"/openapi.json",
	openAPISpecs(app, {
		documentation: {
			info: {
				title: "Fog Machine API",
				version: "1.0.0",
				description: "API for deploying Cloudflare Workers",
			},
		},
	}),
);

app.get("/health", (c) => {
	return c.json({
		status: "ok",
	});
});

app.use("/fp/*", createFiberplane({ openapi: { url: "/api/openapi.json" } }));

export { DeployWorkflow };

export default app;
