import { AsyncLocalStorage } from "node:async_hooks";
import type { Context, Env, MiddlewareHandler } from "hono";

// Create our polyfill implementation using AsyncLocalStorage
const asyncLocalStorage = new AsyncLocalStorage<Context>();

/**
 * Polyfill for Hono's contextStorage middleware
 */
const polyfillContextStorage = (): MiddlewareHandler => {
  return async function contextStorage(c, next) {
    await asyncLocalStorage.run(c, next);
  };
};

/**
 * Polyfill for Hono's getContext function
 */
const polyfillGetContext = <E extends Env = Env>(): Context<E> => {
  const context = asyncLocalStorage.getStore();
  if (!context) {
    throw new Error("Context is not available");
  }
  
  return context as Context<E>;
};

// Default to using the polyfill
let contextStorage = polyfillContextStorage;
let getContext = polyfillGetContext;

// Try to import from the official Hono package
// We use dynamic import to avoid errors if the module doesn't exist
import("hono/context-storage").then((honoContextStorage) => {
  // If we get here, the module exists, so we can use it
  contextStorage = honoContextStorage.contextStorage;
  getContext = honoContextStorage.getContext;
  console.log("Using official Hono context-storage");
}).catch(() => {
  // Module doesn't exist, we'll use the polyfill
  console.log("Hono context-storage not found, using polyfill");
});

export { contextStorage, getContext }; 
