import { EffectCallback, useEffect } from "react";

/**
 * Run a callback once when the component mounts.
 * @param effect Callback to run once
 */
export function useEffectOnce(effect: EffectCallback) {
  useEffect(effect, []);
}