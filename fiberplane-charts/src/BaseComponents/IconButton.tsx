import { forwardRef } from "react";
import styled, { css, DefaultTheme, useTheme } from "styled-components";

export const buttonStyling = css`
    --color: var(--button-normal-color);
    --backgroundColor: var(--button-normal-backgroundColor);
  
    outline: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition-property: background-color, border-color;
    transition-duration: 0.2s;
    transition-timing-function: linear;
    border-radius: ${({ theme }) => theme.borderRadius500};
    box-sizing: border-box;
    height: var(--icon-button-height, 20px);
    width: var(--icon-button-width, 20px);
    padding: var(--icon-button-padding, 2px);
    color: var(--color);
    background-color: var(--background);
    border: 1px solid var(--background);
  
    :focus,
    :hover,
    :active,
    .active {
      cursor: pointer;
    }
  
    :focus {
      border-color: ${({ theme }) => theme.colorPrimary500};
      outline: ${({ theme }) => theme.effectFocusOutline};
  
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
  
    :hover:not([data-disabled][data-dragging], [disabled]) {
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

type IconButtonColorSet = {
    color: string;
    backgroundColor: string;
};

type IconButtonTheme = {
    normal: IconButtonColorSet;
    hover: IconButtonColorSet;
    active: IconButtonColorSet;
    focus: IconButtonColorSet;
    disabled: IconButtonColorSet;
};

function useIconButtonTheme(theme: DefaultTheme): IconButtonTheme {
    return {
        normal: {
            color: theme.colorBase800,
            backgroundColor: "transparent",
        },
        hover: {
            color: theme.colorBase800,
            backgroundColor: theme.colorBase300,
        },
        active: {
            color: theme.colorBackground,
            backgroundColor: theme.colorBase600,
        },
        focus: {
            color: theme.colorBase600,
            backgroundColor: theme.colorBackground,
        },
        disabled: {
            color: theme.colorBase500,
            backgroundColor: "transparent",
        },
    };
}

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

    const theme = useTheme();
    const iconButtonTheme = useIconButtonTheme(theme);

    const newStyle = {
        ...style,
        "--icon-button-padding": buttonSize.padding,
        "--icon-button-width": buttonSize.width,
        "--icon-button-height": buttonSize.height,
        "--icon-button-icon-size": buttonSize.iconSize,

        "--button-normal-color": iconButtonTheme.normal.color,
        "--button-normal-backgroundColor":
            iconButtonTheme.normal.backgroundColor,
        "--button-hover-color": iconButtonTheme.hover.color,
        "--button-hover-backgroundColor": iconButtonTheme.hover.backgroundColor,
        "--button-active-color": iconButtonTheme.active.color,
        "--button-active-backgroundColor":
            iconButtonTheme.active.backgroundColor,
        "--button-focus-color": iconButtonTheme.focus.color,
        "--button-focus-backgroundColor": iconButtonTheme.focus.backgroundColor,
        "--button-disabled-color": iconButtonTheme.disabled.color,
        "--button-disabled-backgroundColor":
            iconButtonTheme.disabled.backgroundColor,
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
