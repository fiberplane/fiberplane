import OpenAPIParser from "@readme/openapi-parser";
import type { OpenAPI, OpenAPIV3} from "openapi-types";
import type { ExtendedTagObject, HttpMethods, OperationObject, PathItemObject, TagObject } from "@lib/types";

let schema: OpenAPIV3.Document;

export async function getSchema() {
  if (schema) {
    return schema;
  }

  try {
    const schemaPath = "../schemas/openapi_v1.yml"; // yeah...

    schema = await OpenAPIParser.validate(schemaPath);
    schema = groupOperationsByTag(schema) as OpenAPIV3.Document;
    return schema;
  } catch (e) {
    console.error(e);
    return;
  }
}

function groupOperationsByTag(schema: OpenAPI.Document): OpenAPI.Document {
  const tagsMap = tagArrayToMap(schema.tags);
  if (schema?.paths === undefined) {
    console.error("No paths found in schema");
    return schema
  }

  for (const [path, obj] of Object.entries(schema?.paths) as [
    keyof PathItemObject,
    PathItemObject,
  ][]) {
    const { parameters, ...rest } = obj; // TODO: double check if the path params are coming through correctly

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

        console.log(restPathItemObj);

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
