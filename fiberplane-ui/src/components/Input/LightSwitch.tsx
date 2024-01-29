import { forwardRef } from "react";
import { styled } from "styled-components";

import {
  HiddenInputElement,
  InputComponentContainer,
  StyledInput,
} from "./common";

type LightSwitchProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
>;

export const LightSwitch = forwardRef<HTMLInputElement, LightSwitchProps>(
  function LightSwitch({ checked, className, ...inputProps }, ref) {
    return (
      <LightSwitchComponentContainer className={className}>
        <HiddenInputElement
          {...inputProps}
          ref={ref}
          type="checkbox"
          checked={checked}
        />

        <SwitchContainer>
          <Switch />
        </SwitchContainer>
      </LightSwitchComponentContainer>
    );
  },
);

const LightSwitchComponentContainer = styled(InputComponentContainer)`
  height: 20px;
  width: 36px;
`;

const Switch = styled.div`
  position: absolute;
  inset: 2px;
  height: 80%;
  aspect-ratio: 1;
  border-radius: var(--radius-full, 9999px);
  background-color: var(--color-fg-onemphasis-default, #fff);
  box-shadow: var(--shadow-xxs, 0px 1px 2px 0px rgb(0 0 0 / 5%));
  transition: transform 0.2s ease-out;
`;

const SwitchContainer = styled(StyledInput)`
  border: unset;
  background-color: unset;

  position: relative;
  border-radius: var(--radius-full, 9999px);
  background-color: var(--color-bg-disabled, #ebeaed);

  ${HiddenInputElement}:hover ~ & {
    background-color: var(--color-bg-elevated-hover, #ebeaed);
  }

  ${HiddenInputElement}:checked ~ & {
    background-color: var(--color-bg-emphasis-primary, #3755ed);

    ${Switch} {
      transform: translateX(100%);
    }
  }

  ${HiddenInputElement}:disabled ~ & {
    background-color: var(--color-bg-disabled, #ebeaed);

    ${Switch} {
      background-color: var(
        --color-fg-onemphasis-subtle, rgb(255 255 255 / 80%)
      );
    }
  }
`;
