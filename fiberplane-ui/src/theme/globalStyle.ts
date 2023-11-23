import { createGlobalStyle, css } from "styled-components";

import { spacingCssVariables } from "./extendedTheme/spacing";
import { variables } from "./figma";

export const GlobalStyle = createGlobalStyle(
  ({ theme: { color, font } }) => css`
    :root {
      ${variables.light}
      ${spacingCssVariables}
    }

    body[data-theme="dark"] {
      ${variables.dark}
    }
    body[data-switching="true"] {
      &,
      * {
        transition: all 0.1s ease-in;
      }
    }

    * {
      box-sizing: border-box;
    }

    html,
    body {
      font: ${font.body.md.regular};
      color: ${color.fg.default};
      background-color: ${color.bg.default};
    }

    html,
    body,
    #root {
      height: 100%;
      width: 100%;
    }

    h1 {
      font: ${font.headings.h1};
      margin: 0;
    }

    h2 {
      font: ${font.headings.h2};
      margin: 0;
    }

    h3 {
      font: ${font.headings.h3};
      margin: 0;
    }

    h4 {
      font: ${font.headings.h4};
      margin: 0;
    }

    h5 {
      font: ${font.headings.h5};
      margin: 0;
    }

    h6 {
      font: ${font.headings.h6};
      margin: 0;
    }

    p {
      margin: 0;
    }

    ol {
      list-style-type: decimal;
    }

    ol ol {
      list-style-type: lower-alpha;
    }

    ol ol,
    ul ul {
      margin: 0;
    }

    li {
      margin: 0;
    }

    a {
      color: ${color.fg.primary};
      cursor: pointer;
      text-decoration: none;
    }

    pre,
    code {
      font: ${font.code.regular};
    }
  `,
);
