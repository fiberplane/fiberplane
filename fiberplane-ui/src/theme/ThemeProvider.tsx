import {
  StyleSheetManager,
  ThemeProvider as StyledComponentsThemeProvider,
} from "styled-components";

import { baseTheme } from "./baseTheme";
import { GlobalStyle } from "./globalStyle";
import "./styled-components.d";

type ThemeProviderProps = {
  children: React.ReactNode;
};

/**
 * Fiberplane theme provider that includes the theme's CSS variables & typed
 * theme object.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <StyleSheetManager enableVendorPrefixes>
      <StyledComponentsThemeProvider theme={baseTheme}>
        <GlobalStyle />
        {children}
      </StyledComponentsThemeProvider>
    </StyleSheetManager>
  );
}
