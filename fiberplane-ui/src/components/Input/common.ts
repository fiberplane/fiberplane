import { styled } from "styled-components";

export const InputComponentContainer = styled.div`
  display: inline-block;
  position: relative;
  width: 16px;
  height: 16px;
  isolation: isolate;
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

export const StyledInput = styled.div`
  display: grid;
  place-items: center;
  background-color: var(--color-bg-subtle);
  border: 1px solid var(--color-fg-muted);
  border-radius: var(--radius-minimal);
  height: 100%;
  width: 100%;
  z-index: 1;
  transition: box-shadow 0.1s ease-in-out 0.05s, border-color 0.2s ease-in-out,
    background-color 0.2s ease-in-out;

  ${HiddenInputElement}:hover ~ & {
    border-color: var(--color-border-primary);
  }

  ${HiddenInputElement}:focus ~ & {
    box-shadow: var(--focus-primary);
  }

  ${HiddenInputElement}:checked ~ & {
    border-color: var(--color-border-primary);
    background-color: var(--color-bg-emphasis-primary-subtle);
    color: var(--color-fg-primary);
  }

  ${HiddenInputElement}:disabled ~ & {
    border-color: var(--color-border-default);
    background-color: var(--color-bg-disabled);
    color: var(--color-border-default);
    cursor: default;
  }
`;

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
