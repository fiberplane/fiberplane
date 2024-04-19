import { forwardRef, useContext } from "react";
import { css, styled } from "styled-components";

import { ChartThemeContext } from "../theme";

export const buttonStyling = css(() => {
  const theme = useContext(ChartThemeContext);

  return css`
    --color: var(--button-normal-color);
    --background: var(--button-normal-backgroundColor);

    outline: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition-property: background-color, border-color;
    transition-duration: 0.2s;
    transition-timing-function: linear;
    border-radius: ${theme.buttonBorderRadius};
    box-sizing: border-box;
    height: var(--icon-button-height, 20px);
    width: var(--icon-button-width, 20px);
    padding: var(--icon-button-padding, 2px);
    color: var(--color);
    background-color: var(--background);
    border: 1px solid var(--background);

    &:focus {
      border-color: ${theme.buttonFocusBorderColor};
      outline: ${theme.buttonFocusOutline};

      --background: var(--button-focus-backgroundColor);
      --color: var(--button-focus-color);
    }

    &:disabled {
      cursor: default;

      --color: var(--button-disabled-color);
      --background: var(--button-disabled-backgroundColor);
    }

    &.active,
    &:active:not([data-dragging], [disabled]) {
      --background: var(--button-active-backgroundColor);
      --color: var(--button-active-color);
    }

    &:hover:not([data-disabled][data-dragging], [disabled]) {
      --background: var(--button-hover-backgroundColor);
      --color: var(--button-hover-color);
      border: none;
    }

    & svg {
      flex: 0 0 var(--icon-button-icon-size);
      width: var(--icon-button-icon-size);
      height: var(--icon-button-icon-size);
    }
  `;
});

const StyledButton = styled.button`
  ${buttonStyling}
`;

const buttonSize = {
  padding: "6px",
  width: "32px",
  height: "32px",
  iconSize: "20px",
};

export type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
};

export const IconButton = forwardRef(function IconButton(
  props: Props,
  ref: React.ForwardedRef<HTMLButtonElement>,
): JSX.Element {
  const {
    className = "",
    style = {},
    active = false,
    children,
    ...otherProps
  } = props;

  const theme = useContext(ChartThemeContext);

  const newStyle = {
    ...style,
    "--icon-button-padding": buttonSize.padding,
    "--icon-button-width": buttonSize.width,
    "--icon-button-height": buttonSize.height,
    "--icon-button-icon-size": buttonSize.iconSize,

    "--button-normal-color": theme.buttonColor,
    "--button-normal-backgroundColor": theme.buttonBackgroundColor,
    "--button-hover-color": theme.buttonHoverColor,
    "--button-hover-backgroundColor": theme.buttonHoverBackgroundColor,
    "--button-active-color": theme.buttonActiveColor,
    "--button-active-backgroundColor": theme.buttonActiveBackgroundColor,
    "--button-focus-color": theme.buttonFocusColor,
    "--button-focus-backgroundColor": theme.buttonFocusBackgroundColor,
    "--button-disabled-color": theme.buttonDisabledColor,
    "--button-disabled-backgroundColor": theme.buttonDisabledBackgroundColor,
  };

  const elementProps = {
    ...otherProps,
    ref,
    style: newStyle,
    className: active ? `${className} active` : className,
    "aria-pressed": active,
  };

  return <StyledButton {...elementProps}>{children}</StyledButton>;
});
