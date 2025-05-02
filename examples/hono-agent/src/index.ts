import { fiberplane } from "@fiberplane/agents";
import { withInstrumentation } from "@fiberplane/agents";
import { Agent } from "agents";
import { Hono } from "hono";
import { agentsMiddleware } from "hono-agents";

interface TestState {
  counter: number;
}

// Create the agent class
export class TestAgentImpl extends Agent<Env, TestState> {
  initialState = { counter: 0 };

  async onStart() {
    console.log("TestAgent started");
  }

  async onRequest(request: Request) {
    // Check if it's a POST request to increment counter
    if (request.method === "POST") {
      try {
        // This is the operation that consumes the body
        const body = await request.json();

        this.state.counter += 1;

        return new Response(
          JSON.stringify({
            message: "Counter incremented",
            counter: this.state.counter,
            receivedData: body,
          }),
          {
            headers: { "Content-Type": "application/json" },
            status: 200,
          },
        );
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: "Invalid JSON body",
          }),
          {
            headers: { "Content-Type": "application/json" },
            status: 400,
          },
        );
      }
    }

    // For GET requests, return the current counter
    return new Response(
      JSON.stringify({
        counter: this.state.counter,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      },
    );
  }
}

interface Env {
  TestAgent: DurableObjectNamespace;
}

// Create a Hono app
const app = new Hono<{ Bindings: Env }>();

app.get("/", (c) => c.text("Hello, World!"));

app.use("*", agentsMiddleware({ onError: (error) => console.error(error) }));

export const TestAgent = withInstrumentation(TestAgentImpl);

export default {
  fetch: fiberplane(app.fetch),
};
