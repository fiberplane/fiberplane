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
  border-radius: var(--radius-full);
  background-color: var(--color-fg-onemphasis-default);
  box-shadow: var(--shadow-xxs, 0px 1px 2px 0px rgb(0 0 0 / 5%));
  transition: transform 0.2s ease-out;
`;

const SwitchContainer = styled(StyledInput)`
  border: unset;
  background-color: unset;

  position: relative;
  border-radius: var(--radius-full);
  background-color: var(--color-bg-disabled);

  ${HiddenInputElement}:hover ~ & {
    background-color: var(--color-bg-elevated-hover);
  }

  ${HiddenInputElement}:checked ~ & {
    background-color: var(
      --color-bg-emphasis-primary, var(--color-bg-emphasis-default)
    );

    ${Switch} {
      transform: translateX(100%);
    }
  }

  ${HiddenInputElement}:disabled ~ & {
    background-color: var(--color-bg-disabled);

    ${Switch} {
      background-color: var(--color-fg-onemphasis-subtle);
    }
  }
`;
