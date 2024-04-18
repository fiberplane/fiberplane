import type React from "react";

type AnyEvent =
  | Event
  | React.ClipboardEvent
  | React.FocusEvent
  | React.FormEvent
  | React.MouseEvent
  | React.KeyboardEvent;

/**
 * To cancel an event means to both stop its propagation and
 * to prevent any default action.
 */
export function cancelEvent(event: AnyEvent) {
  stopPropagation(event);
  event.preventDefault();
}

export function stopPropagation(event: AnyEvent) {
  (event as React.SyntheticEvent).nativeEvent?.stopImmediatePropagation();
  event.stopPropagation();
}
