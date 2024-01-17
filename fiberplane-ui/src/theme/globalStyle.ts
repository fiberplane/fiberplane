import { createGlobalStyle } from "styled-components";

import { spacingCssVariables } from "./baseTheme/spacing";

export const GlobalStyle = createGlobalStyle`
  :root {
    ${spacingCssVariables}
  }

  * {
    box-sizing: border-box;
  }

  html,
  body,
  #root {
    height: 100%;
    width: 100%;
  }

  body[data-switching="true"] {
    &,
    * {
      transition: all 0.1s ease-in;
    }
  }
`;
