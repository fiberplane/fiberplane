import { forwardRef } from "react";
import { css, styled } from "styled-components";

type ButtonStyle = "primary" | "secondary" | "tertiary-color" | "tertiary-grey";

export type ButtonStyleProps = {
  buttonStyle?: ButtonStyle;
  buttonType?: "button" | "textButton";
};

type ButtonProps = Omit<
  React.ComponentProps<typeof StyledButton>,
  "$buttonStyle"
> &
  ButtonStyleProps;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      buttonStyle = "primary",
      buttonType = "button",
      ...elementProps
    },
    ref,
  ) {
    switch (buttonType) {
      case "textButton":
        return (
          <StyledTextButton
            ref={ref}
            $buttonStyle={buttonStyle}
            {...elementProps}
          >
            {children}
          </StyledTextButton>
        );

      default:
        return (
          <StyledButton ref={ref} $buttonStyle={buttonStyle} {...elementProps}>
            {children}
          </StyledButton>
        );
    }
  },
);

export type StyledButtonTransientProps = {
  $buttonStyle: ButtonStyle;
};

const StyledButton = styled.button<StyledButtonTransientProps>(
  () => buttonStyling,
);
const StyledTextButton = styled.button<StyledButtonTransientProps>(
  () => textButtonStyling,
);

export const buttonStyling = css<StyledButtonTransientProps>(
  ({ $buttonStyle }) => {
    const buttonStyle = getButtonStyle($buttonStyle);

    return css`
      /* reset default button styles */
      background: none;
      border: none;
      margin: 0;
      outline: none;
      text-decoration: none;
      /* reset default button styles */

      font: var(--font-buttons-md, 500 14px / 16px Inter);
      max-height: 36px;

      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;

      padding: 8px 16px;
      border-radius: var(--radius-default, 10px);
      box-shadow: var(--shadow-xxs, 0px 1px 2px 0px rgb(0 0 0 / 5%));
      transition: background-color 0.1s ease-in-out, color 0.1s ease-in-out,
        border-color 0.2s ease-in-out, box-shadow 0.1s ease-in-out 0.05s;

      ${buttonStyle}

      &:focus,
      &:hover,
      &:active {
        cursor: pointer;
      }

      &:disabled {
        cursor: not-allowed;
      }

      &:focus,
      &:focus-visible {
        box-shadow: var(--focus-primary, 0px 0px 0px 4px rgb(108 84 255 / 20%));
      }
    `;
  },
);

export const textButtonStyling = css<StyledButtonTransientProps>(
  ({ $buttonStyle }) =>
    css<StyledButtonTransientProps>`
      ${buttonStyling}

      padding: 4px;
      display: inline;
      border: none;
      background: unset;
      height: fit-content;

      ${
        $buttonStyle === "primary"
          ? css`
            color: var(--color-button-primary-fg-default, #fff);
          `
          : css`
            color: var(--color-button-primary-fg-muted, #8c898f);
          `
      }

      &:hover {
        color: var(--color-button-primary-fg-default, #fff);
        background: unset;
      }
    `,
);

function getButtonStyle(buttonStyle: ButtonStyle) {
  switch (buttonStyle) {
    case "primary":
      return css`
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
    case "tertiary-color":
      return css`
        box-shadow: none;
        padding: 4px 2px;
        color: var(--color-fg-primary, #3755ed);
        border: 1px solid transparent;

        &:hover {
          color: var(--color-button-primary-fg-default, #fff);
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
        box-shadow: none;
        padding: 4px 2px;
        color: var(--color-fg-muted, #8c898f);
        border: 1px solid transparent;

        &:hover {
          background-color: var(--color-bg-hover, #ebeaed);
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
          color: var(--color-fg-primary, #3755ed);
        }

        &:disabled {
          color: var(--color-fg-subtle, #bcb9bf);
        }
      `;
  }
}
