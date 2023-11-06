import { ThemeProvider as ScThemeProvider } from "styled-components";

import { GlobalStyle } from "./globalStyle";
import { extendedTheme } from "./extendedTheme";
import "./figma/variables.css";

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ScThemeProvider theme={extendedTheme}>
      <GlobalStyle />
      {children}
    </ScThemeProvider>
  );
}
