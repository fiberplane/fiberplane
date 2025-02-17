import type { KeyValueElement } from "../store";
import type {
  ChangeKeyValueElementsHandler,
  DraftKeyValueElement,
} from "./types";

export const createElementId = () => generateUUID();

export const initializeKeyValueFormData = (): DraftKeyValueElement[] => {
  return [];
};

/**
 * Type guard to determine if a {@link KeyValueElement} is a {@link DraftKeyValueElement}.
 */
export const isDraftElement = (
  element: Omit<KeyValueElement, "parameter">,
): element is Omit<DraftKeyValueElement, "parameter"> => {
  return element.enabled === false && element.key === "" && !element.data.value;
};

/**
 * Count the number of non-draft k/v elements in a {@link KeyValueElement} list.
 */
export const countParameters = (elements: KeyValueElement[]): number => {
  return elements.reduce((count, element) => {
    if (isDraftElement(element)) {
      return count;
    }

    return count + 1;
  }, 0);
};

/**
 * Return a function to immutably update an element of a {@link KeyValueElement} list with a new `enabled` property.
 */
export function createChangeEnabled(
  onChange: ChangeKeyValueElementsHandler,
  allElements: KeyValueElement[],
  element: KeyValueElement,
) {
  return modifyKeyValueElement(
    onChange,
    allElements,
    element,
    (elementToModify, enabled: boolean): KeyValueElement => {
      return {
        ...elementToModify,
        enabled,
      };
    },
  );
}

/**
 * Return a function to immutably update an element of a {@link KeyValueElement[]} with a new `key` property.
 */
export function createChangeKey(
  onChange: ChangeKeyValueElementsHandler,
  allElements: KeyValueElement[],
  element: KeyValueElement,
) {
  return modifyKeyValueElement(
    onChange,
    allElements,
    element,
    (elementToModify, newKey: string): KeyValueElement => {
      const enabled =
        elementToModify.enabled ||
        (!!elementToModify.key && !!elementToModify.data.value);
      return {
        ...elementToModify,
        enabled,
        key: newKey,
      };
    },
  );
}

/**
 * Return a function to immutably update an element of a {@link KeyValueElement[]} with a new `value` property.
 */
export function createChangeValue(
  onChange: ChangeKeyValueElementsHandler,
  allElements: KeyValueElement[],
  element: KeyValueElement,
) {
  return modifyKeyValueElement(
    onChange,
    allElements,
    element,
    (elementToModify, newValue: string | File | undefined): KeyValueElement => {
      // Prefer to only enable the key/value if there's also a key set
      const enabled =
        elementToModify.enabled ||
        (!!elementToModify.key && !!elementToModify.data.value);
      const value =
        newValue === undefined || newValue instanceof File
          ? {
              type: "file" as const,
              value: newValue,
            }
          : {
              type: "string" as const,
              value: newValue,
            };
      const toReturn = {
        ...elementToModify,
        enabled,
        data: value,
      };

      return toReturn;
    },
  );
}

// Utils

/**
 * Helper to create a function that immutably updates an element of a {@link KeyValueElement[]} with a new property,
 * then calls a callback with the new array.
 */
function modifyKeyValueElement<T>(
  onChange: ChangeKeyValueElementsHandler,
  allElements: KeyValueElement[],
  element: KeyValueElement,
  mapNewValue: (p: KeyValueElement, newValue: T) => KeyValueElement,
) {
  return (newValue: T) => {
    const newQueryParams = allElements.map((otherElement): KeyValueElement => {
      if (element.id === otherElement.id) {
        const newElement = mapNewValue(element, newValue);

        // // When we change from draft to not draft, we want to enable the parameter
        // if (isDraftElement(element) && !isDraftElement(newElement)) {
        //   newElement.enabled = true;
        // }

        return newElement;
      }

      return otherElement;
    });
    onChange(newQueryParams);
  };
}

/**
 * Quick and dirty uuid utility
 */
function generateUUID() {
  const timeStamp = new Date().getTime().toString(36);
  const randomPart = () => Math.random().toString(36).substring(2, 15);
  return `${timeStamp}-${randomPart()}-${randomPart()}`;
}

/**
 * Overloaded function which allows
 */
export function reduceKeyValueElements(
  elements: Array<Omit<KeyValueElement, "parameter">>,
): Record<string, string | File>;
export function reduceKeyValueElements(
  elements: Array<Omit<KeyValueElement, "parameter">>,
  options: { stringValuesOnly: true },
): Record<string, string>;

export function reduceKeyValueElements(
  elements: Array<Omit<KeyValueElement, "parameter">>,
  options?: { stringValuesOnly?: boolean },
): Record<string, string | File> {
  return elements.reduce(
    (keyValueRecord, element) => {
      if (isDraftElement(element)) {
        return keyValueRecord;
      }
      const {
        key,
        data: { value, type },
        enabled,
      } = element;
      // Don't append disabled or undefined (file) elements
      if (!enabled || value === undefined) {
        return keyValueRecord;
      }
      // Skip file values if stringValuesOnly is true
      if (options?.stringValuesOnly && type === "file") {
        return keyValueRecord;
      }
      keyValueRecord[key] = value;
      return keyValueRecord;
    },
    {} as Record<string, string | File>,
  );
}

/**
 * Create a key value element of type T and set matching type for the value
 */
export function createKeyValueElement(
  key: string,
  value: KeyValueElement["data"]["value"],
): KeyValueElement {
  const data =
    typeof value === "string"
      ? {
          type: "string" as const,
          value: value,
        }
      : {
          type: "file" as const,
          value: value,
        };

  return {
    id: createElementId(),
    key,
    enabled: true,
    data,
    parameter: {
      name: key,
      in: "formData",
    },
  };
}
