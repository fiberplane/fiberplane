import { forwardRef } from "react";
import styled, { css } from "styled-components";

import {
  HiddenInputElement,
  IconContainer,
  InputComponentContainer,
  StyledInput,
} from "./common";

type RadioButtonProps = React.InputHTMLAttributes<HTMLInputElement>;

export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(
  function RadioButton({ checked, className, ...inputProps }, ref) {
    return (
      <InputComponentContainer className={className}>
        <HiddenInputElement {...inputProps} ref={ref} checked={checked} />

        <RadioContainer>
          {checked && (
            <IconContainer>
              <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <title>Selected</title>
                <circle fill="currentColor" cx="10" cy="10" r="5" />
              </svg>
            </IconContainer>
          )}
        </RadioContainer>
      </InputComponentContainer>
    );
  },
);

const RadioContainer = styled(StyledInput)(
  ({ theme }) => css`
    border-radius: ${theme.radius.full};
  `,
);
