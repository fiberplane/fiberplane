import type { SupportedParameterObject } from "@/lib/isOpenApi";
import { z } from "zod";
import type { StudioState } from "./slices";

const PlaygroundResponseBodySchema = z.discriminatedUnion("type", [
  z.object({
    contentType: z.string(),
    type: z.literal("empty"),
  }),
  z.object({
    contentType: z.string(),
    type: z.literal("json"),
    // NOTE - we pass it as text
    value: z.string(),
  }),
  z.object({
    contentType: z.string(),
    type: z.literal("text"),
    value: z.string(),
  }),
  z.object({
    contentType: z.string(),
    type: z.literal("html"),
    value: z.string(),
  }),
  z.object({
    contentType: z.string(),
    type: z.literal("binary"),
    value: z.instanceof(ArrayBuffer),
  }),
  z.object({
    contentType: z.string(),
    type: z.literal("unknown"),
    value: z.string(),
  }),
  z.object({
    contentType: z.string(),
    type: z.literal("error"),
    value: z.null(),
  }),
]);

export type PlaygroundResponseBody = z.infer<
  typeof PlaygroundResponseBodySchema
>;

const PlaygroundActiveResponseSchema = z.object({
  traceId: z.string().nullable(),
  responseBody: PlaygroundResponseBodySchema,
  responseHeaders: z.record(z.string()).nullable(),
  responseStatusCode: z.string(),
  isFailure: z.boolean(),

  requestUrl: z.string(),
  requestMethod: z.string(),
});

export const isPlaygroundActiveResponse = (
  response: unknown,
): response is PlaygroundActiveResponse => {
  return PlaygroundActiveResponseSchema.safeParse(response).success;
};

export type PlaygroundActiveResponse = z.infer<
  typeof PlaygroundActiveResponseSchema
>;

/**
 * A "key-value element" is a record containing `key` and `value` properties.
 * It can be used to represent things like query parameters or headers.
 */
export type KeyValueElement = {
  id: string;
  key: string;
  data:
    | {
        type: "string";
        value: string;
      }
    | {
        type: "file";
        value: File | undefined;
      };
  enabled: boolean;
  parameter: SupportedParameterObject;
};

export type PlaygroundState = StudioState;

export type PlaygroundBody =
  | {
      type: "text";
      value?: string;
    }
  | {
      type: "json";
      value?: string;
    }
  | {
      type: "form-data";
      isMultipart: boolean;
      value: Array<KeyValueElement>;
    }
  | {
      type: "file";
      value?: File;
    };
export type PlaygroundBodyType = PlaygroundBody["type"];
export type NavigationRoutesView = "list" | "fileTree";
