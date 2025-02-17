import type { Hono } from "hono";
import type { OpenAPIV3 } from "openapi-types";
/**
 * The OpenAPI specification type that only includes OpenAPI 3.0 documents
 * (excludes Swagger 2.0 documents which use 'swagger' instead of 'openapi')
 */
type OpenAPISpec = {
    openapi: string;
    info: OpenAPIV3.InfoObject;
    paths: OpenAPIV3.PathsObject;
    tags?: OpenAPIV3.TagObject[];
    servers?: OpenAPIV3.ServerObject[];
    components?: OpenAPIV3.ComponentsObject;
    security?: OpenAPIV3.SecurityRequirementObject[];
};
interface CreateOpenAPISpecOptions {
    info?: OpenAPIV3.InfoObject;
    tags?: OpenAPIV3.TagObject[];
    servers?: OpenAPIV3.ServerObject[];
    components?: OpenAPIV3.ComponentsObject;
    security?: OpenAPIV3.SecurityRequirementObject[];
}
/**
 * Create an OpenAPI specification for a Hono application
 * @param app - The Hono application to create the OpenAPI specification for
 * @param options - The options for the OpenAPI specification
 * @returns The OpenAPI specification
 * @example
 * ```ts
 * const app = new Hono();
 *
 * app.get("/", (c) => c.text("Hello, World!"));
 *
 * app.get("/openapi.json", (c) => {
 *   const spec = createOpenAPISpec(app, {
 *     info: { title: "My API", version: "1.0.0" },
 *   });
 *   return c.json(spec);
 * });
 * ```
 */
export declare function createOpenAPISpec(app: Hono, options: CreateOpenAPISpecOptions): OpenAPISpec;
export {};
