import { ThemeProvider as StyledComponentsThemeProvider } from "styled-components";

import { extendedTheme } from "./extendedTheme/extendedTheme";
import { GlobalStyle } from "./globalStyle";
import "./styled-components.d";

type ThemeProviderProps = {
  children: React.ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <StyledComponentsThemeProvider theme={extendedTheme}>
      <GlobalStyle />
      {children}
    </StyledComponentsThemeProvider>
  );
}
