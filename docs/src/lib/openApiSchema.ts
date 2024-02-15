import { parse, type SwaggerSpec } from "@scalar/swagger-parser";
import fs from "fs/promises";

let schema: SwaggerSpec;

export async function getSchema() {
	if (schema) {
		return schema;
	}

	try {
		const schemaPath = "../schemas/openapi_v1.yml"; // yeah...

		const schemaFile = await fs.readFile(schemaPath, "utf-8");
		schema = await parse(schemaFile);
		// TODO: maybe filter some items
		return schema;
	} catch (e) {
		console.error(e);
		return;
	}
}