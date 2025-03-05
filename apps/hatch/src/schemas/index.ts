import { z } from "zod";
import "zod-openapi/extend";

export const ApiSuccessResponseSchema = <T extends z.ZodType>(schema: T) =>
	z.object({
		data: schema,
	});

export const ApiErrorResponseSchema = z.object({
	error: z.object({
		message: z.string(),
		code: z.string(),
	}),
});

export const ProjectCreateRequest = z
	.object({
		name: z.string().openapi({
			description: "Project name",
			example: "My project",
		}),
		files: z.record(z.string(), z.string()).openapi({
			description:
				"Project files: key is the file path, value is the file content",
			example: {
				"src/index.ts":
					"export default { fetch() { return new Response('Hello') } }",
			},
		}),
	})
	.openapi({ ref: "ProjectCreateRequest" });

export const ProjectCreateResponse = z
	.object({
		projectId: z.string().openapi({
			description: "Project ID",
			example: "my-project-1jl2ll",
		}),
	})
	.openapi({ ref: "ProjectCreateResponse" });

export const ProjectDeployRequest = z
	.object({
		projectId: z.string().openapi({
			description: "Project ID to bundle and deploy",
			example: "my-project-1jl2ll",
		}),
	})
	.openapi({ ref: "ProjectDeployRequest" });

export const ProjectDeployResponse = z
	.object({
		deployId: z.string().openapi({
			description: "Project deploy ID",
			example: "abc-123-xyz",
		}),
		status: z.string().openapi({
			description: "Initial workflow status",
			example: "queued",
		}),
	})
	.openapi({ ref: "DeployResponse" });

export const DeployStatusRequestSchema = z.object({
	deployId: z.string().openapi({
		description: "Project deploy ID",
		example: "abc-123-xyz",
	}),
});

export const DeployStatusResponseSchema = z.object({
	status: z.string().openapi({
		description: "Deploy workflow status",
		example: "queued",
	}),
});
