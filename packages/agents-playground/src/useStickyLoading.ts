import { useEffect, useRef, useState } from "react";

/**
 * Makes the loading state sticky (for a minimum duration)
 * Ensures that loading state remains true for at least the specified duration
 * even if the original loading state changes quickly
 */
export function useStickyLoading(loading: boolean, duration = 300) {
  const [sticky, setSticky] = useState(false);
  // const previous = useRef(loading);
  const shouldHandleLoadingRef = useRef(false);

  if (loading && !shouldHandleLoadingRef.current) {
    shouldHandleLoadingRef.current = true;
  }

  const shouldHandle = shouldHandleLoadingRef.current;
  useEffect(() => {
    shouldHandleLoadingRef.current = false;
    if (loading || shouldHandle) {
      setSticky(true);
    }

    if (loading) {
      return;
    }

    const timeout = setTimeout(() => {
      setSticky(false);
    }, duration);
    return () => clearTimeout(timeout);
  }, [loading, duration, shouldHandle]);

  return sticky || loading;
}
