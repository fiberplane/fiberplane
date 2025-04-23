import { Hono } from "hono";
import { stream } from "hono/streaming";
import { instrument, measure } from "../src";

const app = new Hono();

// Simple function that sleeps for a bit, logs the duration and returns it
const sleep = measure("sleep", (ms: number) => {
  const start = Date.now();
  return new Promise<number>((resolve) =>
    setTimeout(() => {
      const duration = Date.now() - start;
      console.log(`Slept for ${duration}ms`);
      resolve(duration);
    }, ms),
  );
});

// Simple for testing synchronous javascript execution
const loop = measure("loop", (n: number) => {
  for (let i = 0; i < n; i++) {
    console.log(`Loop iteration: ${i}`);
  }
});

app.get("/", async (c) => {
  console.log("Hello Hono!");
  console.error("This message is logged as an error");
  console.debug("Debug message", { with: "extra", data: true });
  console.warn({ with: "extra", data: true });

  loop(3);

  const response = await fetch("https://api.chucknorris.io/jokes/random");
  const result = await response.json();

  // This should execute beyond the requests time
  c.executionCtx.waitUntil(sleep(30));

  return c.text(`Hello Hono! - ${result.value}`);
});

const delayedError = measure("delayedError", async () => {
  await sleep(2);
  throw new Error("This is an error");
});

app.get("/error", async () => {
  await sleep(5);
  await delayedError();
});

async function* rawRelaxedWelcome() {
  await sleep(500);
  yield "hello! ";
  await sleep(500);
  yield "Hono ";
  await sleep(500);
  yield "is ";
  await sleep(500);
  yield "awesome";
}

// This is an async generator function (and so returns an async iterator)
const generateRelaxedWelcome = measure("relaxedWelcome", rawRelaxedWelcome);

app.get("/stream", async (c) => {
  c.header("Content-Type", "text/plain");
  return stream(c, async (stream) => {
    const result = generateRelaxedWelcome();

    for await (const content of result) {
      await stream.write(content);
    }
  });
});

const fibonacci = measure(
  "fibonacci",
  function* (arg: number): Generator<number> {
    let a = 1;
    let b = 1;
    for (let i = 0; i < arg; i++) {
      yield a;
      [a, b] = [b, a + b];
    }
  },
);
// Example usage:
app.get("/fibonacci/:count", (c) => {
  const count = Number.parseInt(c.req.param("count"), 10);

  const result = fibonacci(count);
  const values = Array.from(result);

  return c.text(`Fibonacci sequence (${count} numbers): ${values.join(", ")}`);
});

app.get("/quick", async (c) => {
  c.header("Content-Type", "text/plain");
  return stream(c, async (stream) => {
    stream.write("ok");
  });
});

export default instrument(app);
