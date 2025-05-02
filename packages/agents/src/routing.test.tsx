import {
  createExecutionContext,
  env,
  waitOnExecutionContext,
} from "cloudflare:test";
import { describe, expect, it, vi } from "vitest";
import { fiberplane } from "./routing";

describe("fiberplane function", () => {
  it("verifies that downstream", async () => {
    // Mock user fetch handler
    const mockUserFetch = vi
      .fn()
      .mockResolvedValue(new Response("User fetch response"));

    // Create minimal mocks for the environment and context
    const ctx = createExecutionContext();

    // Create a fetch handler using the fiberplane wrapper
    const fetchHandler = fiberplane(mockUserFetch);

    // Create a test request with POST method and a body
    const request = new Request("http://example.com/test", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ test: "data" }),
    });

    // Call the fetch handler
    await fetchHandler(request, env, ctx);
    await waitOnExecutionContext(ctx);

    // Verify that mockUserFetch was called
    expect(mockUserFetch).toHaveBeenCalledTimes(1);

    // Key test: verify that we can still access the original request body
    const clonedRequest2 = mockUserFetch.mock.calls[0][0];
    const clonedRequest = clonedRequest2.clone();
    const bodyText = await clonedRequest.text();
    expect(bodyText).toBe(JSON.stringify({ test: "data" }));
  });
});
