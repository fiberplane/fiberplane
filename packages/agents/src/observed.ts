import type { Agent, Connection, ConnectionContext, WSMessage } from "agents";
import { Hono } from "hono";
import { type SSEStreamingApi, streamSSE } from "hono/streaming";
import type { AgentEvent } from "./types";
import {
  createRequestPayload,
  createResponsePayload,
  isPromiseLike,
} from "./utils";
import { registerAgent, registerAgentInstance } from "./agentInstances";
import { createAgentAdminRouter } from "./router";

// Constants for PartyKit headers
export const PARTYKIT_NAMESPACE_HEADER = "x-partykit-namespace";
export const PARTYKIT_ROOM_HEADER = "x-partykit-room";

// Interface for Fiberplane agent properties
export interface FiberProperties {
  activeStreams: Set<SSEStreamingApi>;
}

// Type for an agent with Fiberplane properties
export type FiberDecoratedAgent = Agent<unknown, unknown> & FiberProperties;

// Type for agent constructor
export type AgentConstructor<E = unknown, S = unknown> = new (
  // biome-ignore lint/suspicious/noExplicitAny: mixin pattern requires any[]
  ...args: any[]
) => Agent<E, S>;

/**
 * Class decorator factory that adds Observed capabilities to Agent classes
 *
 * Usage:
 * ```typescript
 *
 * @Observed()
 * export class MyAgent extends Agent {
 *   // Your agent implementation
 * }
 * ```
 */
export function Observed<E = unknown, S = unknown>() {
  return <T extends AgentConstructor<E, S>>(BaseClass: T) => {
    return class extends BaseClass {
      // biome-ignore lint/complexity/noUselessConstructor: Required for TypeScript mixins
      // biome-ignore lint/suspicious/noExplicitAny: Required for TypeScript mixins
      constructor(...args: any[]) {
        super(...args);
        const superClassName = Object.getPrototypeOf(this.constructor).name;
        registerAgent(superClassName);
      }

      fiberRouter?: Hono;

      activeStreams = new Set<SSEStreamingApi>();

      private recordEvent({ event, payload }: AgentEvent) {
        for (const stream of this.activeStreams) {
          stream.writeSSE({
            event,
            data: JSON.stringify(payload),
          });
        }
      }

      onStateUpdate(state: unknown, source: Connection | "server"): void {
        this.recordEvent({
          event: "state_change",
          payload: {
            state,
            source,
          },
        });

        super.onStateUpdate(state as S, source);
      }

      override broadcast(
        msg: string | ArrayBuffer | ArrayBufferView,
        without?: string[] | undefined,
      ): void {
        this.recordEvent({
          event: "broadcast",
          payload: {
            message:
              typeof msg === "string"
                ? msg
                : {
                    type: "binary",
                    size: msg instanceof Blob ? msg.size : msg.byteLength,
                  },
            without,
          },
        });

        super.broadcast(msg, without);
      }

      // Create a proxy for a WebSocket-like object to intercept send calls
      private createWebSocketProxy(connection: Connection): Connection {
        const self = this;
        return new Proxy(connection, {
          get(target, prop, receiver) {
            // Intercept the 'send' method
            if (prop === "send") {
              return function (
                this: Connection,
                message: string | ArrayBuffer | ArrayBufferView,
              ) {
                self.recordEvent({
                  event: "ws_send",
                  payload: {
                    connection: {
                      id: target.id,
                    },
                    message:
                      typeof message === "string"
                        ? message
                        : {
                            type: "binary",
                            size:
                              message instanceof Blob
                                ? message.size
                                : message.byteLength,
                          },
                  },
                });

                // Call the original send method
                return Reflect.get(target, prop, receiver).call(
                  target,
                  message,
                );
              };
            }

            // Return other properties/methods unchanged
            return Reflect.get(target, prop, receiver);
          },
        });
      }

      onMessage(connection: Connection, message: WSMessage) {
        this.recordEvent({
          event: "ws_message",
          payload: {
            connection: {
              id: connection.id,
            },
            message,
          },
        });

        const connectionProxy = this.createWebSocketProxy(connection);

        // Use the original connection for the parent class
        return super.onMessage(connectionProxy, message);
      }

      onConnect(connection: Connection, ctx: ConnectionContext) {
        this.recordEvent({
          event: "ws_open",
          payload: {
            connection,
            ctx,
          },
        });

        // Create a proxied connection to intercept send calls
        const proxiedConnection = this.createWebSocketProxy(connection);

        // Use the proxied connection for the parent class
        return super.onConnect(proxiedConnection, ctx);
      }

      onClose(
        connection: Connection,
        code: number,
        reason: string,
        wasClean: boolean,
      ): void | Promise<void> {
        this.recordEvent({
          event: "ws_close",
          payload: { connection, code, reason, wasClean },
        });

        return super.onClose(connection, code, reason, wasClean);
      }

      onRequest(request: Request): Response | Promise<Response> {
        const namespace = request.headers.get(PARTYKIT_NAMESPACE_HEADER);
        const instance = request.headers.get(PARTYKIT_ROOM_HEADER);

        if (namespace && instance) {
          registerAgentInstance(namespace, instance);
        } else {
          console.error(
            "Missing namespace or instance headers in request",
            request,
          );
        }

        if (!this.fiberRouter) {
          this.fiberRouter = createAgentAdminRouter(this as FiberDecoratedAgent);
        }

        this.fiberRouter.notFound(() => {
          // Extract url & method for re-use in the response payload
          const { url, method } = request;

          // Create a promise chain to ensure the event is recorded
          // since we may need to read the body of the request
          const eventPromise = Promise.resolve().then(async () => {
            this.recordEvent({
              event: "http_request",
              // Clone the request to avoid consuming the body
              payload: await createRequestPayload(
                request.clone() as typeof request,
              ),
            });
          });
          const result = super.onRequest(request);

          // eventPromise.then()
          if (isPromiseLike(result)) {
            return Promise.all([result, eventPromise]).then(async ([res]) => {
              const payload = await createResponsePayload(res.clone());
              this.recordEvent({
                event: "http_response",
                payload: {
                  ...payload,
                  url,
                  method,
                },
              });

              return res;
            });
          }

          const capturedResponse = result.clone();
          eventPromise.then(async () => {
            const payload = await createResponsePayload(capturedResponse);

            this.recordEvent({
              event: "http_response",
              payload: {
                ...payload,
                url,
                method,
              },
            });
          });

          return result;
        });

        return this.fiberRouter.fetch(request);
      }
    } as T;
  };
}