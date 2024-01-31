import { styled } from "styled-components";

export const TextInput = styled.input`
  background-color: var(--color-input-bg, #fff);
  border: 1px solid var(--color-input-border, #d6d4d9);
  border-radius: var(--radius-default, 10px);
  color: var(--color-input-fg-input, #000);
  padding: 6px 12px;
  outline: none;
  min-height: 36px;
  font: var(--font-body-md-regular, 400 14px / 24px Inter);
  box-shadow: var(--shadow-xxs, 0px 1px 2px 0px rgb(0 0 0 / 5%));

  transition: box-shadow 0.1s ease-in-out 0.05s, border-color 0.2s ease-in-out;

  &::placeholder {
    color: var(--color-input-fg-placeholder, #8c898f);
  }

  &:focus,
  &:focus-visible {
    box-shadow: var(--focus-primary, 0px 0px 0px 4px rgb(108 84 255 / 20%));
    border-color: var(--color-border-primary, #3755ed);
  }
  &[data-invalid="true"],
  &:invalid {
    border-color: var(--color-fg-danger, #c40041);
  }
`;
