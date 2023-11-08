import { forwardRef } from "react";

import {
  HiddenInputElement,
  IconContainer,
  InputComponentContainer,
  StyledInput,
} from "./common";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement>;

export const CheckBox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ checked, className, ...inputProps }, ref) {
    return (
      <InputComponentContainer className={className}>
        <HiddenInputElement {...inputProps} ref={ref} checked={checked} />

        <StyledInput>
          {checked && (
            <IconContainer>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Selected</title>
                <path
                  d="M9.91741 12.6078L9.91867 12.6091L8.55777 14L4 9.34163L5.3609 7.95069L8.55651 11.2168L14.6391 5L16 6.39094L9.91741 12.6078Z"
                  fill="currentColor"
                />
              </svg>
            </IconContainer>
          )}
        </StyledInput>
      </InputComponentContainer>
    );
  },
);
