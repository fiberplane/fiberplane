import { describe, expect, it } from "vitest";
import type { FpResolvedConfig } from "../config";
import { DEFAULT_CONFIG, DEFAULT_REDACTED_QUERY_PARAMS } from "../config";
import { getRedactedQueryParams } from "./redacted-query-params";

const baseConfig: FpResolvedConfig = {
  enabled: true,
  mode: "production",
  redactedHeaders: new Set(...DEFAULT_CONFIG.redactedHeaders),
  redactedQueryParams: new Set(...DEFAULT_CONFIG.redactedQueryParams),
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

describe("redacted query params context", () => {
  it("should return custom redacted query params when provided in config", () => {
    const config: FpResolvedConfig = {
      ...baseConfig,
      redactedQueryParams: new Set(["token", "apiKey", "secret"]),
    };

    const result = getRedactedQueryParams(config);
    expect(result).toEqual(new Set(["token", "apiKey", "secret"]));
  });

  it("should return default redacted query params when config is undefined", () => {
    const result = getRedactedQueryParams(undefined);
    expect(result).toEqual(new Set(DEFAULT_REDACTED_QUERY_PARAMS));
  });

  it("should return default redacted query params when no config is provided", () => {
    const result = getRedactedQueryParams();
    expect(result).toEqual(new Set(DEFAULT_REDACTED_QUERY_PARAMS));
  });

  it("should return default redacted query params when config.redactedQueryParams is undefined", () => {
    const { redactedQueryParams, ...configWithoutParams } = baseConfig;
    const config = configWithoutParams as FpResolvedConfig;

    const result = getRedactedQueryParams(config);
    expect(result).toEqual(new Set(DEFAULT_REDACTED_QUERY_PARAMS));
  });
});
