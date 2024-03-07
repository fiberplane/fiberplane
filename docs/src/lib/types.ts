import type { OpenAPI, OpenAPIV2, OpenAPIV3 } from "openapi-types";

export type Operation = Omit<OpenAPIV3.OperationObject, "tags"> & {
  httpVerb: HttpMethods;
  path: string;
};

export type TagObject = OpenAPIV3.TagObject;

export type ExtendedTagObject = TagObject & {
  operations: Operation[] | undefined;
};

export type PathItemObject = OpenAPIV3.PathItemObject;

export type OperationObject = OpenAPIV3.OperationObject;

export type HttpMethods = OpenAPIV3.HttpMethods;
