import { styled } from "styled-components";

export const TextInput = styled.input`
  background-color: var(--color-input-bg);
  border: 1px solid var(--color-input-border);
  border-radius: var(--radius-default);
  color: var(--color-input-fg-input);
  padding: 6px 12px;
  outline: none;
  font: var(--font-body-md-regular);
  box-shadow: var(--shadow-xxs);

  transition: box-shadow 0.1s ease-in-out 0.05s, border-color 0.2s ease-in-out;

  &::placeholder {
    color: var(--color-input-fg-placeholder);
  }

  &:focus,
  &:focus-visible {
    box-shadow: var(--focus-primary);
    border-color: var(--color-border-primary);
  }
  &[data-invalid="true"],
  &:invalid {
    border-color: var(--color-fg-danger);
  }
`;
