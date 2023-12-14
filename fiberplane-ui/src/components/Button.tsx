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
  ({ $buttonStyle, theme }) => {
    const buttonStyle = getButtonStyle($buttonStyle);

    return css`
      /* reset default button styles */
      background: none;
      border: none;
      margin: 0;
      outline: none;
      text-decoration: none;
      /* reset default button styles */

      font: ${theme.font.buttons.md};
      max-height: 36px;

      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;

      padding: 8px 16px;
      border-radius: ${theme.radius.default};
      box-shadow: ${theme.effect.shadow.xxs};
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
        box-shadow: ${theme.effect.focus.primary};
      }
    `;
  },
);

export const textButtonStyling = css<StyledButtonTransientProps>(
  ({ $buttonStyle, theme }) =>
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
            color: ${theme.color.fg.primary};
          `
          : css`
            color: ${theme.color.fg.muted};
          `
      }

      &:hover {
        color: ${theme.color.fg.default};
        background: unset;
      }
    `,
);

function getButtonStyle(buttonStyle: ButtonStyle) {
  switch (buttonStyle) {
    case "primary":
      return css(
        ({ theme }) => css`
          background-color: ${theme.color.button.primary.bg.default};
          color: ${theme.color.button.primary.fg.default};

          &:hover {
            background-color: ${theme.color.button.primary.bg.hover};
          }

          &:disabled {
            background-color: ${theme.color.button.primary.bg.disabled};
            color: ${theme.color.button.primary.fg.disabled};
            cursor: not-allowed;
          }
        `,
      );
    case "secondary":
      return css(
        ({ theme }) => css`
          background-color: ${theme.color.button.secondary.bg};
          color: ${theme.color.button.secondary.fg};
          border: 1px solid ${theme.color.button.secondary.border};

          &:hover {
            background-color: ${theme.color.bg.hover};
          }

          &:focus,
          &:focus-visible {
            border-color: ${theme.color.border.primary};
          }

          &:disabled {
            border-color: ${theme.color.border.muted};
            background-color: ${theme.color.button.secondary.bg};
            color: ${theme.color.fg.subtle};
          }
        `,
      );
    case "tertiary-color":
      return css(
        ({ theme }) => css`
          box-shadow: none;
          padding: 4px 2px;
          color: ${theme.color.fg.primary};
          border: 1px solid transparent;

          &:hover {
            color: ${theme.color.fg.default};
          }

          &:focus,
          &:focus-visible {
            border-color: ${theme.color.border.primary};
          }

          &:disabled {
            color: ${theme.color.fg.subtle};
          }
        `,
      );
    case "tertiary-grey":
      return css(
        ({ theme }) => css`
          box-shadow: none;
          padding: 4px 2px;
          color: ${theme.color.fg.muted};
          border: 1px solid transparent;

          &:hover {
            background-color: ${theme.color.bg.hover};
          }

          &:focus,
          &:focus-visible {
            border-color: ${theme.color.border.primary};
          }

          &:disabled {
            color: ${theme.color.fg.subtle};
          }

          &.active, /* Adding the .active class here too for NavLinks */
          &:active {
            color: ${theme.color.fg.primary};
          }

          &:disabled {
            color: ${theme.color.fg.subtle};
          }
        `,
      );
  }
}
