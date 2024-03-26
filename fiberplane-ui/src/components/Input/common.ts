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
  background-color: var(--color-bg-subtle, #f9f9fa);
  border: 1px solid var(--color-fg-muted, #8c898f);
  border-radius: var(--radius-minimal, 8px);
  height: 100%;
  width: 100%;
  z-index: 1;
  transition: box-shadow 0.1s ease-in-out 0.05s, border-color 0.2s ease-in-out,
    background-color 0.2s ease-in-out;

  ${HiddenInputElement}:hover ~ & {
    border-color: var(--color-border-primary, #3755ed);
  }

  ${HiddenInputElement}:focus ~ & {
    box-shadow: var(--focus-primary, 0px 0px 0px 4px rgb(108 84 255 / 20%));
  }

  ${HiddenInputElement}:checked ~ & {
    border-color: var(--color-border-primary, #3755ed);
    background-color: var(--color-bg-subtle, #212326);
    color: var(--color-fg-primary, #3755ed);
  }

  ${HiddenInputElement}:disabled ~ & {
    border-color: var(--color-border-default, #d6d4d9);
    background-color: var(--color-bg-disabled, #ebeaed);
    color: var(--color-border-default, #d6d4d9);
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
