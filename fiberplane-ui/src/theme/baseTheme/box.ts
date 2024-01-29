import { css } from "styled-components";

export const box = {
  spacing: {
    page: {
      inline: "var(--box-spacing-page-inline)",
      block: "var(--box-spacing-page-block)",
      gap: "var(--box-spacing-page-gap)",
    },
    content: {
      gap: {
        md: "var(--box-spacing-content-gap-md)",
        lg: "var(--box-spacing-content-gap-lg)",
      },
      templateColumns: "var(--box-spacing-content-template-columns)",
    },
  },
} as const;

export const boxSpacingVariables = css(
  ({ theme: { media } }) => css`
    --box-spacing-page-inline: 12px;
    --box-spacing-page-block: 20px 40px;
    --box-spacing-page-gap: 24px;
    --box-spacing-content-gap-md: 12px;
    --box-spacing-content-gap-lg: 16px;
    --box-spacing-content-template-columns: 1fr;

    ${media.sm`
      --box-spacing-page-inline: 20px;
      --box-spacing-page-block: 40px 80px;
      --box-spacing-content-template-columns: repeat(2, 1fr);
    `}

    ${media.md`
      --box-spacing-page-inline: 40px;
      --box-spacing-page-gap: 32px;
      --box-spacing-content-gap-md: 16px;
      --box-spacing-content-gap-lg: 20px;
    `}

    ${media.lg`
      --box-spacing-content-template-columns: repeat(3, 1fr);
    `}
  `,
);
