import type { QueryClient } from "@tanstack/react-query";
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

// Database result type
export type DatabaseResult = Record<string, DBTable>;

// API Types
export type AgentDetails = {
  id: string;
  scriptName: string | null;
  className: string;
  instances: Array<string>;
};

export type ListAgentsResponse = Array<AgentDetails>;

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
export const unset = Symbol("unset");

/**
 * Schema for options passed from the server via data-options
 */
export const OptionsSchema = z.object({
  mountedPath: z.string().default("/fp"),
  version: z.string().optional(),
  commitHash: z.string().optional(),
});

/**
 * Extract the type from the Zod schema
 */
export type RouterOptions = z.infer<typeof OptionsSchema> & {
  queryClient: QueryClient;
};
