import type { CombinedEvent } from "./agents";

// Parse a single event body
export const parseEventBody = (
  body: string,
): { type: string; content: string | Record<string, unknown> } => {
  if (!body) {
    return { type: "empty", content: "" };
  }

  // Format is like "0:\"Hello\"" or "f:{...}" or "e:{...}" etc.
  const match = body.match(/^([a-zA-Z0-9]):(.*)/);
  if (!match) {
    return { type: "unknown", content: body };
  }

  const [, typeCode, content] = match;

  switch (typeCode) {
    case "0": // Text content
      try {
        // Handle escaped quotes in JSON strings
        return { type: "text", content: JSON.parse(content) };
      } catch (error) {
        return { type: "text", content: content };
      }
    case "f": // Message ID
      try {
        return { type: "messageId", content: JSON.parse(content) };
      } catch (error) {
        return { type: "messageId", content: content };
      }
    case "9": // Tool call
      try {
        return { type: "toolCall", content: JSON.parse(content) };
      } catch (error) {
        return { type: "toolCall", content: content };
      }
    case "a": // Tool result
      try {
        return { type: "toolResult", content: JSON.parse(content) };
      } catch (error) {
        return { type: "toolResult", content: content };
      }
    case "e": // Status/finish
      try {
        return { type: "status", content: JSON.parse(content) };
      } catch (error) {
        return { type: "status", content: content };
      }
    case "d": // Done
      try {
        return { type: "done", content: JSON.parse(content) };
      } catch (error) {
        return { type: "done", content: content };
      }
    default:
      return { type: "unknown", content: body };
  }
};

/**
 * Updates the combined event with the new chunk of data.
 * @param combinedEvent - The current combined event to update.
 * @param body - The new chunk of data to add to the event.
 * @returns void
 */
export function updateCombinedEvent(
  combinedEvent: CombinedEvent,
  event: CombinedEvent["payload"]["chunks"][number],
): void {
  const parsedBody = parseEventBody(event.body);

  // Update content and metadata based on the parsed body
  let updatedContent = combinedEvent.payload.content;
  const updatedMetadata = { ...combinedEvent.payload.metadata };
  if (parsedBody.type === "text" && typeof parsedBody.content === "string") {
    updatedContent += parsedBody.content;
  } else if (
    parsedBody.type === "messageId" &&
    typeof parsedBody.content === "object"
  ) {
    const messageId = parsedBody.content.messageId;
    if (typeof messageId === "string") {
      updatedMetadata.messageId = messageId;
    } else {
      console.warn("Unexpected messageId format", messageId);
    }
  } else if (parsedBody.type === "toolCall") {
    if (typeof parsedBody.content === "object") {
      updatedMetadata.toolCalls.push(parsedBody.content);
    } else {
      console.warn("unexpected toolCall format", parsedBody.content);
    }
  } else if (parsedBody.type === "toolResult") {
    if (typeof parsedBody.content === "object") {
      updatedMetadata.toolResults.push(parsedBody.content);
    } else {
      console.warn("unexpected toolResult format", parsedBody.content);
    }
  } else if (parsedBody.type === "status" || parsedBody.type === "done") {
    if (typeof parsedBody.content === "object") {
      updatedMetadata.status = parsedBody.content;
    } else {
      console.warn("unexpected status format", parsedBody.content);
    }
  }

  // Add the new chunk
  const updatedChunks = [...combinedEvent.payload.chunks, event];
  combinedEvent.payload.chunks = updatedChunks;
  combinedEvent.payload.content = updatedContent;
  combinedEvent.payload.metadata = updatedMetadata;
  if (event.done) {
    combinedEvent.payload.done = event.done;
  }
}
