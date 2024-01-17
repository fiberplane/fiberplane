import { css } from "styled-components";

export const spacing = {
  page: {
    inline: "var(--spacing-page-inline)",
    block: "var(--spacing-page-block)",
    gap: "var(--spacing-page-gap)",
  },
  content: {
    gap: {
      md: "var(--spacing-content-gap-md)",
      lg: "var(--spacing-content-gap-lg)",
    },
    templateColumns: "var(--spacing-content-template-columns)",
  },
} as const;

export const spacingCssVariables = css(
  ({ theme: { media } }) => css`
    --spacing-page-inline: 12px;
    --spacing-page-block: 20px 40px;
    --spacing-page-gap: 24px;
    --spacing-content-gap-md: 12px;
    --spacing-content-gap-lg: 16px;
    --spacing-content-template-columns: 1fr;

    ${media.sm`
      --spacing-page-inline: 20px;
      --spacing-page-block: 40px 80px;
      --spacing-content-template-columns: repeat(2, 1fr);
    `}

    ${media.md`
      --spacing-page-inline: 40px;
      --spacing-page-gap: 32px;
      --spacing-content-gap-md: 16px;
      --spacing-content-gap-lg: 20px;
    `}

    ${media.lg`
      --spacing-content-template-columns: repeat(3, 1fr);
    `}
  `,
);
