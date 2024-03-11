import type {
  ExtendedTagObject,
  HttpMethods,
  OperationObject,
  PathItemObject,
  TagObject,
} from "@lib/types";
import OpenAPIParser from "@readme/openapi-parser";
import type { OpenAPI, OpenAPIV3 } from "openapi-types";

let schema: OpenAPIV3.Document;

export async function getSchema() {
  if (schema) {
    return schema;
  }

  try {
    const schemaPath = "../schemas/openapi_v1.yml";

    // there's some sort of type clashes between what @readme/openapi-parser
    // outputs and what openapi-types defines but they're effectively the
    // same thing
    schema = groupOperationsByTag(
      (await OpenAPIParser.validate(schemaPath)) as OpenAPIV3.Document,
    );
    return schema;
  } catch (e) {
    console.error(e);
    return;
  }
}

function groupOperationsByTag(schema: OpenAPIV3.Document): OpenAPIV3.Document {
  const tagsMap = tagArrayToMap(schema.tags);
  if (schema.paths && schema?.paths === undefined) {
    console.error("No paths found in schema");
    return schema;
  }

  for (const [path, obj] of Object.entries(schema.paths) as [
    keyof PathItemObject,
    PathItemObject,
  ][]) {
    const { parameters, ...rest } = obj;

    for (const [httpVerb, pathItemObj] of Object.entries(rest) as [
      HttpMethods,
      OperationObject,
    ][]) {
      if ("tags" in pathItemObj === false || pathItemObj.tags === undefined) {
        continue;
      }

      const { tags, ...restPathItemObj } = pathItemObj;

      for (const tag of tags) {
        let tagObj = tagsMap.get(tag);

        if (tagObj === undefined) {
          tagObj = {
            name: tag,
            description: "",
            operations: [],
          };
        }

        if (tagObj.operations === undefined) tagObj.operations = [];

        if (parameters && "$ref" in parameters) {
          throw new Error("Ref parameters are not supported");
        }

        tagObj.operations.push({
          httpVerb,
          path: path as string,
          parameters,
          ...restPathItemObj,
        });

        tagsMap.set(tag, tagObj);
      }
    }
  }

  const updatedTags = Array.from(tagsMap.values());

  schema.tags = updatedTags;
  return schema;
}

function tagArrayToMap(
  arr: TagObject[] | undefined,
): Map<TagObject["name"], ExtendedTagObject> {
  const map = new Map();

  if (arr === undefined) {
    return map;
  }

  for (const obj of arr) {
    const newObj: ExtendedTagObject = {
      operations: [],
      ...obj,
    };
    map.set(newObj.name, newObj);
  }
  return map;
}
