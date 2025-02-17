import type { Context } from "hono";
/**
 * Logs debug messages when debug mode is enabled.
 * Accepts either a boolean flag or a Hono Context to determine if debug is enabled.
 * (Assumes `c.get("debug")` stores the debug flag)
 *
 * Handles any logging errors by catching and ignoring them
 */
export declare function logIfDebug(debug: boolean, message: unknown, ...params: unknown[]): void;
export declare function logIfDebug(debug: Context, message: unknown, ...params: unknown[]): void;
