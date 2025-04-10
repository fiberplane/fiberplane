import type { UIAgentEvent } from "@/types";
import { parseDataStreamPart } from "ai";

/**
 * Updates the combined event with the new chunk of data.
 * @param combinedEvent - The current combined event to update.
 * @param body - The new chunk of data to add to the event.
 * @returns void
 */
export function updateCombinedEvent(
  combinedEvent: UIAgentEvent & { type: "combined_event" },
  event: (UIAgentEvent & {
    type: "combined_event";
  })["payload"]["chunks"][number],
): void {
  if (event.body === "" && event.done) {
    combinedEvent.payload.done = event.done;
    return;
  }

  const parsed = parseDataStreamPart(event.body);
  let updatedContent = combinedEvent.payload.content;
  const updatedMetadata = { ...combinedEvent.payload.metadata };

  switch (parsed.type) {
    case "text":
      updatedContent += parsed.value;
      break;
    case "start_step":
      updatedMetadata.messageId = parsed.value.messageId;
      break;
    case "tool_call":
      updatedMetadata.toolCalls = [
        ...(updatedMetadata.toolCalls || []),
        parsed.value,
      ];
      break;
    case "tool_result":
      updatedMetadata.toolResults = [
        ...(updatedMetadata.toolResults || []),
        parsed.value,
      ];
      break;
    case "finish_step":
    case "finish_message":
      updatedMetadata.status = parsed.value;
      break;
    default:
      console.warn(
        `Encountered an event type that is not (yet) supported: ${parsed.type}`,
      );
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
