import { useEffect, useState } from "react";

const noEntries: Array<IntersectionObserverEntry> = [];

export function useIntersectionObserver(
  ref: React.RefObject<HTMLElement>,
  options?: IntersectionObserverInit,
) {
  const [intersections, setIntersections] = useState(noEntries);

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
  }, [element, options]);

  return intersections;
}
