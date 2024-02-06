import { EventEmitter } from "eventemitter3";
import { useEffect, useState } from "react";

import { useHandler } from "./useHandler";

type JsonPrimitive = string | number | boolean | null;

type JsonObject = { [key: string]: JsonValue };

type JsonArray = Array<JsonValue>;

type JsonValue = JsonPrimitive | JsonArray | JsonObject;

/**
 * Hook that returns the current value of a localStorage key and a setter for
 * that value. It also listens for changes to the localStorage key and updates
 * the value accordingly.
 *
 * If the setter is called with `null`, the key will be removed from
 * localStorage and the default value will be used instead.
 *
 * @param key The localStorage key
 * @param defaultValue The default value to use if the key doesn't exist
 * @returns A tuple containing the current value and a setter for that value
 *
 * @example
 * const [value, setValue] = useLocalStorage("my_key", "my_default_value");
 *
 * // If the key "my_key" doesn't exist in localStorage, value will be set to "my_default_value"
 * setValue("my_new_value");
 * // If later the updated value is logged
 * console.log(value); // "my_new_value"
 * // If the setter is called with null the value in localStorage will be removed
 * // and the default value will be used
 * setValue(null); // Removes the key from localStorage (causing value to be)
 * // Logging the updated value would result in the default value being used (not null)
 * console.log(value); // "my_default_value"
 */
export function useLocalStorage<T extends JsonValue>(
  key: string,
  defaultValue: T,
): readonly [T, (value: T | null) => void] {
  const [value, internalSetValue] = useState(() => {
    const storedValue = localStorage.getItem(key);
    if (storedValue === null) {
      return defaultValue;
    }

    const parsedValue = safeJSONParse(storedValue);

    if (parsedValue === null) {
      return defaultValue;
    }

    return parsedValue;
  });

  const handleChange = useHandler((event: StorageEvent) => {
    if (event.key === key) {
      internalSetValue(event.newValue ? JSON.parse(event.newValue) : undefined);
    }
  });

  const handleLocalChange = useHandler(
    (event: { key: string; newValue: T | undefined }) => {
      // If the key is different or the value is the same, do nothing
      if (event.key !== key || event.newValue === value) {
        return;
      }

      // If the value is nul
      if (event.newValue === null && value !== defaultValue) {
        internalSetValue(defaultValue);
        return;
      }

      internalSetValue(event.newValue);
    },
  );

  useEffect(() => {
    window.addEventListener("storage", handleChange);
    wrappedLocalStorage.addListener("local_storage", handleLocalChange);

    return () => {
      window.removeEventListener("storage", handleChange);
      wrappedLocalStorage.removeListener("local_storage", handleLocalChange);
    };
  }, [handleChange, handleLocalChange]);

  // Passing in null will result the value to the initial value
  const setValue = useHandler((value: T | null) => {
    const newValue = value ?? defaultValue;
    internalSetValue(newValue);
    if (value === null) {
      wrappedLocalStorage.removeItem(key);
      return;
    }

    wrappedLocalStorage.setItem(key, newValue);
  });

  return [value, setValue] as const;
}

class WrappedLocalStorage extends EventEmitter {
  constructor() {
    super();

    window.addEventListener("storage", (event) => {
      if (!event.key) {
        return;
      }
      this.emit(event.key, event.newValue);
    });
  }

  getItem(key: string) {
    const value = localStorage.getItem(key);

    if (value === null) {
      return null;
    }

    return safeJSONParse(value);
  }

  setItem(key: string, value: JsonValue) {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
    this.emit("local_storage", { key, newValue: value });
  }

  removeItem(key: string) {
    localStorage.removeItem(key);
    this.emit("local_storage", { key, newValue: null });
  }
}

const wrappedLocalStorage = new WrappedLocalStorage();

function safeJSONParse(value: string | null) {
  try {
    if (value === null) {
      return;
    }
    return JSON.parse(value);
  } catch (error) {
    console.warn("Error parsing json from localStorage", error);
    return null;
  }
}
