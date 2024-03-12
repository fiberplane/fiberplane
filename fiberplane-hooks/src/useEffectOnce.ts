import { type EffectCallback, useEffect } from "react";

const noDeps: Array<void> = [];

/**
 * Run a callback once when the component mounts.
 * @param effect Callback to run once
 */
export function useEffectOnce(effect: EffectCallback) {
  useEffect(effect, noDeps);
}
