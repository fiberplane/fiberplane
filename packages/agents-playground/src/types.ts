import { z } from "zod";

// Define types for the result structure
export type ColumnType =
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "object"
  | "array";

// Map SQLite column types to TypeScript types
type TypeMapping<T extends ColumnType[]> = T extends ["string"]
  ? string
  : T extends ["number"]
    ? number
    : T extends ["boolean"]
      ? boolean
      : T extends ["null"]
        ? null
        : T extends ["object"]
          ? Record<string, unknown>
          : T extends ["array"]
            ? unknown[]
            : T extends Array<infer U>
              ? U extends ColumnType
                ? unknown
                : never
              : unknown;

// Generic table type that ensures data matches column structure
export type Table<
  C extends Record<string, ColumnType[]> = Record<string, ColumnType[]>,
> = {
  columns: C;
  data: Array<{
    [K in keyof C]: TypeMapping<C[K]>;
  }>;
};

// Database result type
export type DatabaseResult = Record<string, Table>;

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
