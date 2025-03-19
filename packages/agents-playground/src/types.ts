import { z } from "zod";

// Define types for the result structure
export type DBColumnType =
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "object"
  | "array";

// Map SQLite column types to TypeScript types
type TypeMapping<T extends DBColumnType[]> = T extends ["string"]
  ? string
  : T extends ["null", "string"]
    ? string | null
    : T extends ["number"]
      ? number
      : T extends ["null", "number"]
        ? number | null
        : T extends ["boolean"]
          ? boolean
          : T extends ["null", "boolean"]
            ? boolean
            : T extends ["null"]
              ? null
              : T extends ["object"]
                ? Record<string, unknown>
                : T extends ["null", "object"]
                  ? Record<string, unknown> | null
                  : T extends ["array"]
                    ? unknown[]
                    : T extends Array<infer U>
                      ? U extends DBColumnType
                        ? unknown
                        : never
                      : unknown;

// Generic table type that ensures data matches column structure
export type DBTable<
  C extends Record<string, DBColumnType[]> = Record<string, DBColumnType[]>,
> = {
  columns: C;
  data: Array<{
    [K in keyof C]: TypeMapping<C[K]>;
  }>;
};

type T = DBTable<{
  id: ["string", "null"];
}>;

type Data = T["data"];

// const table: T = {
// 	columns: {
// 		id: ["string"],
// 	},
// 	data: [
// 		{
// 			id: "1",
// 		},
// 	],
// };

// table.data

// Database result type
export type DatabaseResult = Record<string, DBTable>;

/**
 * Return type for the getDurableObjectsFromConfig function
 */
export type DurableObjectsSuccess = {
  success: true;
  durableObjects: {
    bindings: {
      name: string;
      className: string;
      scriptName: string | null;
    }[];
    migrations: {
      tag?: string;
      newClasses: string[];
    }[];
  };
};

export type DurableObjectsError = {
  success: false;
  error: string;
};

export type DurableObjectsResult = DurableObjectsSuccess | DurableObjectsError;

export const SubscribeSchema = z.object({
  type: z.literal("subscribe"),
  payload: z.object({
    agent: z.string(),
  }),
});
export const UnsubscribeSchema = z.object({
  type: z.literal("unsubscribe"),
  payload: z.object({
    agent: z.string(),
  }),
});

export const UpdateSchema = z.object({
  type: z.literal("update"),
  payload: z.object({
    agent: z.string(),
  }),
});

export const MessageSchema = z.discriminatedUnion("type", [
  SubscribeSchema,
  UnsubscribeSchema,
  UpdateSchema,
]);
export type Message = z.infer<typeof MessageSchema>;
