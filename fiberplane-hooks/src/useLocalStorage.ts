import { useEffect, useState } from "react";

import { useHandler } from "./useHandler";

declare global {
  interface WindowEventMap {
    "local-storage": StorageEvent;
  }
}

const IS_SERVER = typeof window === "undefined";

/**
 * Hook that returns a value from `localStorage` and a setter for changing it.
 * The hook requires a `key` to identify the value in `localStorage` and a
 * `defaultValue` to return if the value is not found in `localStorage`.
 * The watches the value stored in `localStorage` and returns the updated value.
 */
export function useLocalStorage<T>(key: string, defaultValue: T) {
  const getCurrentValue = useHandler(() => {
    if (IS_SERVER) {
      return defaultValue;
    }

    try {
      const rawValue = window.localStorage.getItem(key);
      if (rawValue === null) {
        return defaultValue;
      }

      const parsedValue: T = JSON.parse(rawValue);
      return parsedValue;
    } catch (error) {
      console.error("Error reading from localStorage", error);
      return defaultValue;
    }
  });

  const [storedValue, setStoredValue] = useState<T>(getCurrentValue);

  /**
   * A setter function that writes the new value to `localStorage` and updates
   * the state.
   */
  const setValue: React.Dispatch<React.SetStateAction<T>> = useHandler(
    (value) => {
      if (IS_SERVER) {
        return;
      }

      try {
        const newValue = JSON.stringify(value);
        window.localStorage.setItem(key, newValue);
        setStoredValue(value);

        // As the `storage` event handler is not triggered by the same window
        // that triggered the change, we need to manually dispatch the event.
        const storageEvent = new StorageEvent("local-storage", { key });
        window.dispatchEvent(storageEvent);
      } catch (error) {
        console.error("Error writing to localStorage", error);
      }
    },
  );

  const handleStorageChange = useHandler((event: StorageEvent) => {
    if (event.key !== key) {
      return;
    }

    const currentValue = getCurrentValue();
    setStoredValue(currentValue);
  });

  useEffect(() => {
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("local-storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("local-storage", handleStorageChange);
    };
  }, [handleStorageChange]);

  return [storedValue, setValue] as const;
}
