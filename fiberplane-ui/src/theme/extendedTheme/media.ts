import { css } from "styled-components";

/**
 * Breakpoints for media queries, in pixels.
 */
export const BREAKPOINTS = {
  sm: 512,
  md: 768,
  lg: 960,
  xl: 1120,
} as const;

type CssFunction = (...args: Parameters<typeof css>) => ReturnType<typeof css>;

/**
 * Used for adding media queries in the styled components theme. It makes it
 * possible to write media queries like you would using the `css` function.
 * @example
 * const StyledComponent = styled.div(
 * ({ theme: { media } }) => css`
 *   background-color: blue;
 *
 *   ${media.sm`
 *     background-color: red;
 *   `}
 * `);
 */
export const media = Object.fromEntries(
  Object.entries(BREAKPOINTS).map(([key, value]) => [
    key,
    (...args) => css`
      @media (min-width: ${value}px) {
        ${css(...args)}
      }
    `,
  ]),
) as Record<keyof typeof BREAKPOINTS, CssFunction>;
