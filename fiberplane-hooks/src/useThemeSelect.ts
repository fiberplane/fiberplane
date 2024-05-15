import { useEffect } from "react";

import { useLocalStorage } from "./useLocalStorage";
import { useMedia } from "./useMedia";
import { usePrevious } from "./usePrevious";

type Theme = "dark" | "light";

/**
 * Returns the current theme and getters & setters for changing the theme. It
 * stores the theme in localStorage if it's not the system's preferred color
 * scheme.
 */
export function useThemeSelect() {
  const [storedTheme, setStoredTheme] = useLocalStorage<Theme | null>(
    "theme",
    null,
  );

  const systemPrefersDarkTheme = useMedia("(prefers-color-scheme: dark)");
  const systemDefaultTheme: Theme = systemPrefersDarkTheme ? "dark" : "light";

  const setToSystemTheme = () => setStoredTheme(null);
  const setThemePreference = (theme: Theme) => setStoredTheme(theme);

  // The computed theme value. Either the stored (and validated), or system's
  // default theme.
  const theme: Theme =
    storedTheme && isValidTheme(storedTheme) ? storedTheme : systemDefaultTheme;
  const previousTheme = usePrevious(theme);

  useEffect(() => {
    // Set the theme on the `document.body` element. If there's no stored theme,
    // we remove the `data-theme` attribute so the system's preferred color
    // scheme is used.
    document.body.dataset.theme = storedTheme ? theme : "";

    let listenerId: ReturnType<typeof setTimeout>;

    // By setting `data-switching` we can apply a transition to the theme change
    // in CSS.
    if (previousTheme && previousTheme !== theme) {
      document.body.dataset.switching = "true";
      listenerId = setTimeout(() => {
        document.body.dataset.switching = "false";
      }, 100);
    }

    return () => {
      clearTimeout(listenerId);
    };
  }, [theme, storedTheme, previousTheme]);

  return {
    /**
     * Either `dark` or `light`, regardless of it's the system or user-selected
     * preference.
     */
    currentTheme: theme,
    /**
     * `true` if the theme is the system's preferred color scheme, `false`
     * otherwise.
     */
    isSystemPreference: !storedTheme,
    /**
     * When called, sets the theme to the given value and stores it in
     * `localStorage`.
     * @param theme The theme to set: either `dark` or `light`.
     */
    setThemePreference,
    /**
     * When called, sets the theme to the system's preferred color scheme &
     * removes the stored theme preference from `localStorage`.
     */
    setToSystemTheme,
  };
}

function isValidTheme(theme: string): theme is Theme {
  return theme === "dark" || theme === "light";
}
