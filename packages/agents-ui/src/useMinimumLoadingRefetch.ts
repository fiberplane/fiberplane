import { useCallback, useRef, useState } from "react";

/**
 * A hook that wraps a refetch function to ensure loading state lasts for at least the specified duration
 *
 * @param refetchFn The original refetch function to wrap
 * @param minDuration Minimum duration in ms that loading state should be maintained
 * @returns [wrappedRefetch, isLoading] - The wrapped refetch function and current loading state
 */
export function useMinimumLoadingRefetch<T>(
  refetchFn: () => Promise<T>,
  minDuration = 500,
): [() => Promise<T>, boolean] {
  const [isLoading, setIsLoading] = useState(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const wrappedRefetch = useCallback(() => {
    // Clear any existing timer
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }

    // Set loading state immediately
    setIsLoading(true);

    // Track when the refetch started
    const startTime = Date.now();

    // Call the original refetch function
    return refetchFn()
      .then((result) => {
        // Calculate how much time has elapsed
        const elapsedTime = Date.now() - startTime;

        // Determine remaining time to meet minimum duration
        const remainingTime = Math.max(0, minDuration - elapsedTime);

        // Set a timer to turn off loading state after remaining time
        if (remainingTime > 0) {
          loadingTimerRef.current = setTimeout(() => {
            setIsLoading(false);
            loadingTimerRef.current = null;
          }, remainingTime);
        } else {
          // If minimum duration already elapsed, turn off loading immediately
          setIsLoading(false);
        }

        return result;
      })
      .catch((error) => {
        // Ensure loading state is turned off on error too
        setIsLoading(false);
        throw error;
      });
  }, [refetchFn, minDuration]);

  return [wrappedRefetch, isLoading];
}
