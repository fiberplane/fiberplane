import { useMemo, useState } from "react";

import type { KeyValueElement } from "../store";
import { createElementId, isDraftElement } from "./data";
import type { DraftKeyValueElement } from "./types";

const INITIAL_KEY_VALUE_ELEMENT: KeyValueElement = {
  id: createElementId(),
  key: "" as const,
  data: {
    type: "string" as const,
    value: "" as const,
  },
  enabled: false,
  parameter: {
    name: "",
    // We don't know where this element might be used, and it's not really relevant here either.
    // This key value element is for things that the user is adding beyond what's defined in the openapi spec/doc
    in: "query",
    // Schema seems to be optional, but we should assume "string" as the default value
    // schema: {
    //   type: "string",
    // },
  },
};

export const useKeyValueForm = (initial?: KeyValueElement[]) => {
  const [internalList, updateInternalList] = useState<KeyValueElement[]>(
    initial ?? [
      {
        ...INITIAL_KEY_VALUE_ELEMENT,
      },
    ],
  );

  const { elements: keyValueElements } = useKeyValueElements(internalList);

  return {
    keyValueElements,
    setKeyValueElements: updateInternalList,
  };
};

/**
 * Hook that manages the state of a key-value form, ensuring that there is always a single
 * {@link DraftKeyValueElement} at the end of the array of key/value elements.
 *
 * This allows us to treat the element like a form element for new key/value elements.
 */
export function useKeyValueElements(elements: KeyValueElement[]) {
  const elementsWithDraft = useMemo(
    () => enforceTerminalDraftParameter(elements.map(disableBlankParameter)),
    [elements],
  );

  return { elements: elementsWithDraft };
}

/**
 * Immutably disable a {@link KeyValueElement} if it has a blank key and value.
 */
const disableBlankParameter = (element: KeyValueElement) => {
  if (element.key === "" && !element.data.value) {
    return { ...element, enabled: false };
  }

  return element;
};

/**
 * NOTE - We're using this instead of enforceSingleTerminalDraftElement
 *        in order to preserve focus on the last element when you delete all of a key.
 *        (Hard to explain, just know this is preferable to `enforceSingleTerminalDraftElement` for UI behavior.)
 *
 * If the final element of the array is a {@link DraftKeyValueElement}, return the array
 * Otherwise, return the array with a new draft element appended.
 *
 */
export const enforceTerminalDraftParameter = (elements: KeyValueElement[]) => {
  const finalElement = elements[elements.length - 1];
  const hasTerminalDraftElement = finalElement
    ? isDraftElement(finalElement)
    : false;
  if (hasTerminalDraftElement) {
    return elements;
  }

  return concatDraftElement(elements);
};

/**
 * NOTE - This is the desired behavior, but does not play nicely with focus in the UI.
 *
 * If the final element of the array is a {@link DraftKeyValueElement}, return the array
 * Otherwise, return the array with a new draft element appended.
 *
 * If there are multiple draft parameters, all will be filtered out, and a new draft element will be appended at the end.
 */
export const enforceSingleTerminalDraftElement = (
  elements: KeyValueElement[],
) => {
  const firstDraftParameterIndex = elements.findIndex(isDraftElement);

  const hasSingleTerminalDraftElement =
    firstDraftParameterIndex + 1 === elements.length;

  if (hasSingleTerminalDraftElement) {
    return elements;
  }

  if (firstDraftParameterIndex === -1) {
    return concatDraftElement(elements);
  }

  const nonDraftElements = elements.filter((p) => !isDraftElement(p));
  return concatDraftElement(nonDraftElements);
};

/**
 * Helper to immutabily add a {@link DraftKeyValueElement} to the end of an array.
 */
const concatDraftElement = (elements: KeyValueElement[]) => {
  const DRAFT_ELEMENT: DraftKeyValueElement = {
    ...INITIAL_KEY_VALUE_ELEMENT,
    id: createElementId(),
    enabled: false,
  };
  return [...elements, DRAFT_ELEMENT];
};
