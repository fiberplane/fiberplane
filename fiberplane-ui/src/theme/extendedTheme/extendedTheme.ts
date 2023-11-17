import merge from "lodash.merge";
import { css } from "styled-components";

import { theme } from "../figma";
import { media } from "./media";
import { spacing } from "./spacing";

// Theme object that extends the base theme with additional values which aren't
// supported or added in Figma. Lodash's merge function is used to deeply merge
// the base theme with the extended theme.
export const extendedTheme = merge(theme, {
  color: {
    bg: {
      placeholder: {
        gradient: "var(--color-bg-placeholder-gradient)",
      },
    },
  },
  media,
  spacing,
});

// CSS color values that aren't coming from, or supported by Figma. Reference
// these variables in `extendTheme` above.
/**
 * Light CSS variables that are used for the extended theme.
 * To be used in `globalStyle`.
 */
export const lightCssVariables = css(
  ({ theme }) => css`
    --color-bg-placeholder-gradient: linear-gradient(
      90deg,
      ${theme.color.neutral[100]} 25%,
      ${theme.color.neutral[200]} 75%,
      ${theme.color.neutral[100]} 100%
    );
  `,
);

/**
 * Dark CSS variables that are used for the extended theme.
 * To be used in `globalStyle`.
 */
export const darkCssVariables = css(
  ({ theme }) => css`
    --color-bg-placeholder-gradient: linear-gradient(
      90deg,
      ${theme.color.neutral[800]} 25%,
      ${theme.color.neutral[700]} 75%,
      ${theme.color.neutral[800]} 100%
    );
  `,
);
