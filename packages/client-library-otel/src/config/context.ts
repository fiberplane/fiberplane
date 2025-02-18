import { type Context, context } from "@opentelemetry/api";
import type { FpResolvedConfig } from "./config";

/**
 * Unique symbol used to store/retrieve the FPX config on the active context.
 */
export const FPX_CONFIG_KEY = Symbol("fpx-config");

/**
 * Retrieves the FPX configuration from the current active context, or returns the default configuration.
 */
export function getFpResolvedConfig(): FpResolvedConfig | undefined {
  const config = context.active().getValue(FPX_CONFIG_KEY) as
    | FpResolvedConfig
    | undefined;
  return config;
}

export function setFpResolvedConfig(
  context: Context,
  config: FpResolvedConfig,
): Context {
  return context.setValue(FPX_CONFIG_KEY, config);
}
