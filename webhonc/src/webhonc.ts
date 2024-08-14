import { DurableObject } from "cloudflare:workers";
import type { WsMessage } from "@fiberplane/fpx-types";
import type { Bindings } from "./types";

export class WebHonc extends DurableObject<Bindings> {
  sessions: Map<string, WebSocket>;

  constructor(ctx: DurableObjectState, env: Bindings) {
    super(ctx, env);
    this.ctx = ctx;
    this.env = env;
    this.sessions = new Map();

    for (const ws of this.ctx.getWebSockets()) {
      const { connectionId } = ws.deserializeAttachment();
      this.sessions.set(connectionId, ws);
    }
  }

  async fetch(_req: Request) {
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    const connectionId = this.ctx.id.toString();

    this.ctx.acceptWebSocket(server);

    // we send the connectionId down to the client
    server.send(
      JSON.stringify({ event: "connection_open", payload: { connectionId } }),
    );
    this.sessions.set(connectionId, server);
    server.serializeAttachment({ connectionId });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  webSocketMessage(_ws: WebSocket, message: string | ArrayBuffer) {
    console.debug("Received message from WS connection:", message);
  }

  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean,
  ) {
    console.debug(
      "WebSocket closed:",
      code,
      reason,
      wasClean,
      ws.deserializeAttachment(),
    );
    try {
      ws.close(code);
    } catch (error) {
      console.error("Error closing WebSocket:", error);
    }
  }

  public async pushWebhookData(connectionId: string, data: WsMessage) {
    console.debug("Serializing and sending data to connection:", connectionId);
    const ws = this.sessions.get(connectionId);
    const payload = JSON.stringify(data);
    if (ws) {
      ws.send(payload);
    }
  }
}
