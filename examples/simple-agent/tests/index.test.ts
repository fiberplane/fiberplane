import { SELF } from "cloudflare:test";
import { describe, expect, it } from "vitest";
// Could import any other source file/function here
import worker from "../src/server";

describe("Chat worker", () => {
  it("responds with Not found", async () => {
    // const request = new IncomingRequest("http://example.com", {
    //   method: "GET",
    // });
    // Create an empty context to pass to `worker.fetch()`
    // const ctx = createExecutionContext();
    // const response = await worker.fetch(request, env, ctx);
    // // Wait for all `Promise`s passed to `ctx.waitUntil()` to settle before running test assertions
    // await waitOnExecutionContext(ctx);
    const response = await SELF.fetch("http://example.com/404");
    expect(await response.text()).toBe("Not found");
    expect(response.status).toBe(404);
  });
});
