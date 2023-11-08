import styled, { css } from "styled-components";

export const InputComponentContainer = styled.div`
  display: inline-block;
  position: relative;
  width: 16px;
  height: 16px;
  isolation: isolate;
`;

export const StyledInput = styled.div(
  ({ theme }) => css`
    display: grid;
    place-items: center;
    background-color: ${theme.color.bg.subtle};
    border: 1px solid ${theme.color.fg.muted};
    border-radius: ${theme.radius.minimal};
    height: 100%;
    width: 100%;
    z-index: 1;
    transition: box-shadow 0.1s ease-in-out 0.05s, border-color 0.2s ease-in-out,
      background-color 0.2s ease-in-out;

    ${HiddenInputElement}:hover ~ & {
      border-color: ${theme.color.border.primary};
    }

    ${HiddenInputElement}:focus ~ & {
      box-shadow: ${theme.effect.focus.primary};
    }

    ${HiddenInputElement}:checked ~ & {
      border-color: ${theme.color.border.primary};
      background-color: ${theme.color.bg.emphasis["primary-subtle"]};
      color: ${theme.color.fg.primary};
    }

    ${HiddenInputElement}:disabled ~ & {
      border-color: ${theme.color.border.default};
      background-color: ${theme.color.bg.disabled};
      color: ${theme.color.border.default};
      cursor: default;
    }
  `,
);

export const IconContainer = styled.div`
  @keyframes check {
    to {
      scale: 1;
      opacity: 1;
    }
  }

  & > svg {
    position: absolute;
    z-index: 2;
    inset: 0;
    height: 87.5%;
    width: 87.5%;
    margin: auto;
    scale: 0.3;
    opacity: 0;
    animation: check 0.1s ease-in-out forwards;
  }
`;

export const HiddenInputElement = styled.input`
  appearance: none;
  outline: none;
  border: none;

  cursor: pointer;
  position: absolute;
  inset: 0;
  margin: 0;
  z-index: 3;
`;
