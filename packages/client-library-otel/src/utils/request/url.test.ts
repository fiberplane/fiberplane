import { describe, expect, it } from "vitest";
import type { FpResolvedConfig } from "../../config";
import { getRedactedUrl } from "./url";

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

describe("request utils", () => {
  describe("getRedactedUrl", () => {
    it("should not redact any parameters when tracing everything", () => {
      const config: FpResolvedConfig = {
        ...baseConfig,
        mode: "local",
        redactedQueryParams: new Set(["token", "password"]),
      };

      const url = new URL(
        "https://api.example.com/test?token=secret&name=test",
      );
      const redactedUrl = getRedactedUrl(url, config);

      expect(redactedUrl).toBe(
        "https://api.example.com/test?token=secret&name=test",
      );
    });

    it("should redact sensitive query parameters when not tracing everything", () => {
      const config: FpResolvedConfig = {
        ...baseConfig,
        mode: "production",
        redactedQueryParams: new Set(["token", "password"]),
      };

      const url = new URL(
        "https://api.example.com/test?token=secret&name=test",
      );
      const redactedUrl = getRedactedUrl(url, config);

      expect(redactedUrl).toBe(
        "https://api.example.com/test?token=REDACTED&name=test",
      );
    });

    it("should handle multiple sensitive parameters", () => {
      const config: FpResolvedConfig = {
        ...baseConfig,
        mode: "production",
        redactedQueryParams: new Set(["token", "password", "key"]),
      };

      const url = new URL(
        "https://api.example.com/test?token=secret&password=123&key=abc&name=test",
      );
      const redactedUrl = getRedactedUrl(url, config);

      expect(redactedUrl).toBe(
        "https://api.example.com/test?token=REDACTED&password=REDACTED&key=REDACTED&name=test",
      );
    });

    it("should handle URLs without query parameters", () => {
      const config: FpResolvedConfig = {
        ...baseConfig,
        mode: "production",
        redactedQueryParams: new Set(["token", "password"]),
      };

      const url = new URL("https://api.example.com/test");
      const redactedUrl = getRedactedUrl(url, config);

      expect(redactedUrl).toBe("https://api.example.com/test");
    });
  });
});
