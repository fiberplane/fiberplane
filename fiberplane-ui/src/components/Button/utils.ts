import { css } from "styled-components";

import type { ButtonSize, ButtonStyle } from "./types";

export function getButtonStyle(
  buttonStyle: ButtonStyle,
  buttonSize: ButtonSize,
) {
  const buttonSizeStyles = getButtonSizeStyles(buttonSize);
  const tertiarySizeStyles = getTertiaryButtonSizeStyles(buttonSize);

  switch (buttonStyle) {
    case "primary":
      return css`
        ${buttonSizeStyles}

        background-color: var(--color-button-primary-bg-default, #3755ed);
        color: var(--color-button-primary-fg-default, #fff);

        &:hover {
          background-color: var(--color-button-primary-bg-hover, #abb5ff);
        }

        &:disabled {
          background-color: var(--color-button-primary-bg-disabled, #ebeaed);
          color: var(--color-button-primary-fg-disabled, #fff);
          cursor: not-allowed;
        }
      `;
    case "secondary":
      return css`
        ${buttonSizeStyles}

        background-color: var(--color-button-secondary-bg, #fff);
        color: var(--color-button-secondary-fg, #111114);
        border: 1px solid var(--color-button-secondary-border, #d6d4d9);

        &:hover {
          background-color: var(--color-bg-hover, #ebeaed);
        }

        &:focus,
        &:focus-visible {
          border-color: var(--color-border-primary, #3755ed);
        }

        &:disabled {
          border-color: var(--color-border-muted, #ebeaed);
          background-color: var(--color-button-secondary-bg, #fff);
          color: var(--color-fg-subtle, #bcb9bf);
        }
      `;
    case "danger":
      return css`
        ${buttonSizeStyles}

        background-color: var(
          --color-button-primary-danger-bg-default,
          #f53667
        );
        color: var(--color-button-primary-danger-fg-default, #fff);

        &:hover {
          background: var(--color-button-primary-danger-bg-hover, #bf1b44);
        }

        &&:focus,
        &&:focus-visible {
          border: 1px solid var(--color-border-primary, #4661eb);
          box-shadow: 0px 0px 0px 4px
            var(--color-border-focus-primary, rgba(70, 97, 235, 0.2));
        }
      `;
    case "tertiary-color":
      return css`
        ${tertiarySizeStyles}

        color: var(--color-fg-primary, #3755ed);

        &:hover {
          color: var(--color-fg-default, #000);
        }

        &:focus,
        &:focus-visible {
          border-color: var(--color-border-primary, #3755ed);
        }

        &:disabled {
          color: var(--color-fg-subtle, #bcb9bf);
        }
      `;
    case "tertiary-grey":
      return css`
        ${tertiarySizeStyles}

        color: var(--color-fg-muted, #8c898f);

        &:hover {
          color: var(--color-fg-default, #000000);
        }

        &:focus,
        &:focus-visible {
          border-color: var(--color-border-primary, #3755ed);
        }

        &:disabled {
          color: var(--color-fg-subtle, #bcb9bf);
        }

        &.active, /* Adding the .active class here too for NavLinks */
        &:active {
          color: var(--color-fg-default, #000000);
        }

        &:disabled {
          color: var(--color-fg-subtle, #bcb9bf);
        }
      `;
  }
}

function getButtonSizeStyles(buttonSize: ButtonSize) {
  switch (buttonSize) {
    case "small":
      return css`
        padding: 8px 16px;
        font: var(--font-buttons-md, 500 14px / 16px Inter);
        border-radius: var(--radius-default, 10px);
        min-height: 28px;
      `;
    default:
      return css`
        padding: 8px 12px;
        font: var(--font-buttons-sm, 500 12px / 16px Inter);
        border-radius: var(--radius-default, 8px);
        min-height: 32px;
      `;
  }
}

function getTertiaryButtonSizeStyles(buttonSize: ButtonSize) {
  switch (buttonSize) {
    case "small":
      return css`
        font: var(--font-buttons-sm, 500 12px / 16px Inter);
        border-radius: var(--radius-lowest, 4px);
        min-height: 20px;
        gap: 4px;
      `;
    default:
      return css`
        font: var(--font-buttons-md, 500 14px / 16px Inter);
        border-radius: var(--radius-default, 6px);
        min-height: 24px;
        gap: 6px;
      `;
  }
}
