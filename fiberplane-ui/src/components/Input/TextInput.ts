import styled, { css } from "styled-components";

export const TextInput = styled.input(
  ({ theme }) => css`
    background-color: ${theme.color.input.bg};
    border: 1px solid ${theme.color.input.border};
    border-radius: ${theme.radius.default};
    color: ${theme.color.input.fg};
    padding: 6px 12px;
    outline: none;
    font: ${theme.font.body.md.regular};
    box-shadow: ${theme.effect.shadow.xxs};

    transition: box-shadow 0.1s ease-in-out 0.05s, border-color 0.2s ease-in-out;

    &::placeholder {
      color: ${theme.color.input.fg.placeholder};
    }

    &:focus,
    &:focus-visible {
      box-shadow: ${theme.effect.focus.primary};
      border-color: ${theme.color.border.primary};
    }
    &[data-invalid="true"],
    &:invalid {
      border-color: ${theme.color.fg.danger};
    }
  `,
);
