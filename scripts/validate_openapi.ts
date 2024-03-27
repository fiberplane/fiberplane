// This simple script used to validate the OpenAPI schema uses
// the same @readme/openapi-parser package that our docs builder
// relies on.

import OpenAPIParser from "npm:@readme/openapi-parser";
import type { OpenAPI } from "npm:openapi-types";

const schemaPath = "schemas/openapi_v1.yml";

try {
  const api = (await OpenAPIParser.validate(schemaPath)) as OpenAPI.Document;
  console.log(
    "Successfully validated OpenAPI schema: ",
    api.info.title,
    api.info.version,
  );
} catch (e) {
  console.error(e);
}
