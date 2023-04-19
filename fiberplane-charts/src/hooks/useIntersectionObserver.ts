import { useEffect, useState } from "react";

const noEntries: Array<IntersectionObserverEntry> = [];

export function useIntersectionObserver(
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit,
) {
  const [intersections, setIntersections] =
    useState<Array<IntersectionObserverEntry>>(noEntries);

  const element = ref.current;
  useEffect(() => {
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(setIntersections, options);
    observer.observe(element);
    return () => {
      observer.disconnect();
      setIntersections(noEntries);
    };
  }, [element, options?.root, options?.rootMargin, options?.threshold]);

  return intersections;
}
