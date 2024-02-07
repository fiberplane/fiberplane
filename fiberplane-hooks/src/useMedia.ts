import { useEffect, useState } from "react";

/**
 * Returns whether the current window matches the given
 * media query.
 * @returns `true` if the media query matches, `false` otherwise.
 * @example
 * const isWide = useMedia("(min-width: 600px)");
 */
export function useMedia(query: string) {
  const [matches, setState] = useState(true);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);

    const onChange = () => setState(mediaQueryList.matches);
    mediaQueryList.addEventListener("change", onChange);

    setState(mediaQueryList.matches);

    return () => {
      mediaQueryList.removeEventListener("change", onChange);
    };
  }, [query]);

  return matches;
}
