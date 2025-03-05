import { ApiErrorResponseSchema } from "@/schemas";
import { resolver } from "hono-openapi/zod";

export const commonErrorResponses = {
	400: {
		description: "Invalid request",
		content: {
			"application/json": {
				schema: resolver(ApiErrorResponseSchema),
			},
		},
	},
	401: {
		description: "Unauthorized",
		content: {
			"application/json": {
				schema: resolver(ApiErrorResponseSchema),
			},
		},
	},
	403: {
		description: "Forbidden",
		content: {
			"application/json": {
				schema: resolver(ApiErrorResponseSchema),
			},
		},
	},
	404: {
		description: "Resource not found",
		content: {
			"application/json": {
				schema: resolver(ApiErrorResponseSchema),
			},
		},
	},
	500: {
		description: "Internal server error",
		content: {
			"application/json": {
				schema: resolver(ApiErrorResponseSchema),
			},
		},
	},
} as const;
