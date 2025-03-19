// Re-export utility functions
import { Agent, type Connection, type ConnectionContext } from "agents";
import { AIChatAgent } from "agents/ai-chat-agent";

export class FiberAgent<Env> extends Agent<Env> {
  onRequest(request: Request) {
    console.log("onRequest", request);
    return super.onRequest(request);
  }
}

export class FiberChatAgent<Env> extends AIChatAgent<Env> {
  getCallable() {}

  onRequest(request: Request) {
    console.log("onRequest", request.url);
    return super.onRequest(request);
  }


  onConnect(connection: Connection, ctx: ConnectionContext) {
    console.log("onConnect", connection, ctx.request.url);
    // Check if the URL ee
    // Check if the URL ends with /fp-admin
    if (connection.server === "admin") {
      // Handle the admin connection here
      console.log("Handling admin connection");
      // Add your admin-specific handling logic here
      return;
    }

    // Otherwise, delegate to the parent implementation
    return super.onConnect(connection, ctx);
  }
}
