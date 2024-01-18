import { createGlobalStyle } from "styled-components";

import { boxSpacingVariables } from "./baseTheme/box";

export const GlobalStyle = createGlobalStyle`
  :root {
    ${boxSpacingVariables}
  }
`;
