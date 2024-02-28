import type { OpenAPI, OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

export type Operation = Omit<OpenAPI.Operation, "tags"> & {
  httpVerb:
    | OpenAPIV3.HttpMethods
    | OpenAPIV3_1.HttpMethods
    | OpenAPIV2.HttpMethods;
  path: string;
};

export type TagObject =
  | OpenAPIV3.TagObject
  | OpenAPIV3_1.TagObject
  | OpenAPIV2.TagObject;

export type ExtendedTagObject = TagObject & { operations: Operation[] };

export type PathItemObject = 
  | OpenAPIV3.PathItemObject 
  | OpenAPIV3_1.PathItemObject 
  | OpenAPIV2.PathItemObject

export type OperationObject =
  | OpenAPIV3.OperationObject
  | OpenAPIV3_1.OperationObject
  | OpenAPIV2.OperationObject;

export type HttpMethods =
  | OpenAPIV3.HttpMethods
  | OpenAPIV3_1.HttpMethods
  | OpenAPIV2.HttpMethods;
