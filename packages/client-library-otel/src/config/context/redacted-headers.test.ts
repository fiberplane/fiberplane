import { describe, expect, it } from "vitest";
import type { FpResolvedConfig } from "../config";
import { DEFAULT_REDACTED_HEADERS } from "../config";
import { getRedactedHeaders } from "./redacted-headers";

const baseConfig: FpResolvedConfig = {
  enabled: true,
  mode: "production",
  redactedHeaders: new Set(),
  redactedQueryParams: new Set(),
  otelEndpoint: "http://localhost:4318",
  otelToken: "",
  logLevel: "debug",
  serviceName: "test-service",
  libraryDebugMode: false,
  monitor: {
    fetch: true,
    logging: true,
    cfBindings: true,
  },
};

describe("redacted headers context", () => {
  it("should return custom redacted headers when provided in config", () => {
    const config: FpResolvedConfig = {
      ...baseConfig,
      redactedHeaders: new Set(["authorization", "x-api-key", "cookie"]),
    };

    const result = getRedactedHeaders(config);
    expect(result).toEqual(new Set(["authorization", "x-api-key", "cookie"]));
  });

  it("should return default redacted headers when config is undefined", () => {
    const result = getRedactedHeaders(undefined);
    expect(result).toEqual(new Set(DEFAULT_REDACTED_HEADERS));
  });

  it("should return default redacted headers when no config is provided", () => {
    const result = getRedactedHeaders();
    expect(result).toEqual(new Set(DEFAULT_REDACTED_HEADERS));
  });

  it("should return default redacted headers when config.redactedHeaders is undefined", () => {
    const { redactedHeaders, ...configWithoutHeaders } = baseConfig;
    const config = configWithoutHeaders as FpResolvedConfig;

    const result = getRedactedHeaders(config);
    expect(result).toEqual(new Set(DEFAULT_REDACTED_HEADERS));
  });
});
