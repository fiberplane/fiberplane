/**
 * Taken from: https://github.com/gregberge/react-merge-refs
 *
 * Copyright (c) 2020 Greg Bergé
 *
 * @license MIT
 */
export function mergeRefs<T extends HTMLElement>(
  refs: Array<React.MutableRefObject<T> | React.LegacyRef<T>>,
): React.RefCallback<T> {
  return (value) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    }
  };
}
