import { forwardRef } from "react";
import { css, styled } from "styled-components";

import type { ButtonSize, ButtonStyle } from "./types";
import { getButtonStyle } from "./utils";

type ButtonStyleProps = {
  buttonStyle?: ButtonStyle;
  buttonSize?: ButtonSize;
  buttonType?: "button" | "textButton";
};

type ButtonProps = Omit<
  React.ComponentProps<typeof StyledButton>,
  "$buttonSize" | "$buttonStyle"
> &
  ButtonStyleProps & {
    isActive?: boolean;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      children,
      buttonSize = "medium",
      buttonStyle = "primary",
      buttonType = "button",
      isActive = false,
      ...elementProps
    },
    ref,
  ) {
    const className = isActive ? "active" : undefined;

    if (buttonType === "textButton") {
      return (
        <StyledTextButton
          ref={ref}
          $buttonSize={buttonSize}
          $buttonStyle={buttonStyle}
          className={className}
          {...elementProps}
        >
          {children}
        </StyledTextButton>
      );
    }

    return (
      <StyledButton
        ref={ref}
        $buttonSize={buttonSize}
        $buttonStyle={buttonStyle}
        className={className}
        {...elementProps}
      >
        {children}
      </StyledButton>
    );
  },
);

export type StyledButtonTransientProps = {
  $buttonSize: ButtonSize;
  $buttonStyle: ButtonStyle;
};

const StyledButton = styled.button<StyledButtonTransientProps>(
  () => buttonStyling,
);
const StyledTextButton = styled.button<StyledButtonTransientProps>(
  () => textButtonStyling,
);

export const buttonStyling = css<StyledButtonTransientProps>(
  ({ $buttonStyle, $buttonSize }) => {
    const buttonStyle = getButtonStyle($buttonStyle, $buttonSize);

    return css`
      /* reset default button styles */
      background: none;
      border: none;
      margin: 0;
      outline: none;
      text-decoration: none;
      /* reset default button styles */

      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;

      padding: 8px 16px;
      border-radius: var(--radius-default, 10px);
      box-shadow: var(--shadow-xxs, 0px 1px 2px 0px rgb(0 0 0 / 5%));
      transition: background-color 0.1s ease-in-out, color 0.1s ease-in-out,
        border-color 0.2s ease-in-out, box-shadow 0.1s ease-in-out 0.05s;
      cursor: pointer;

      ${buttonStyle}

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

      display: inline;
      border: none;
      background: unset;
      height: fit-content;
      padding: 4px 2px;
      box-shadow: none;
      border: 1px solid transparent;

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
