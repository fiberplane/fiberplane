import { forwardRef } from "react";
import { css, styled } from "styled-components";

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

const Switch = styled.div(
  ({ theme }) => css`
    position: absolute;
    inset: 2px;
    height: 80%;
    aspect-ratio: 1;
    border-radius: ${theme.radius.full};
    background-color: ${theme.color.fg.onemphasis.default};
    box-shadow: ${theme.effect.shadow.xxs};
    transition: transform 0.2s ease-out;
  `,
);

const SwitchContainer = styled(StyledInput)(
  ({ theme }) => css`
    border: unset;
    background-color: unset;

    position: relative;
    border-radius: ${theme.radius.full};
    background-color: ${theme.color.bg.disabled};

    ${HiddenInputElement}:hover ~ & {
      background-color: ${theme.color.bg.elevated.hover};
    }

    ${HiddenInputElement}:checked ~ & {
      background-color: ${theme.color.bg.emphasis.primary};

      ${Switch} {
        transform: translateX(100%);
      }
    }

    ${HiddenInputElement}:disabled ~ & {
      background-color: ${theme.color.bg.disabled};

      ${Switch} {
        background-color: ${theme.color.fg.onemphasis.subtle};
      }
    }
  `,
);
