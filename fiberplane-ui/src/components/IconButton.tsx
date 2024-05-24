import { forwardRef } from "react";
import { css, styled } from "styled-components";

import { Button } from "./Button";
import { Icon } from "./Icon";

type IconButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "buttonType" | "children"
> &
  Pick<React.ComponentProps<typeof Icon>, "iconType">;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ buttonSize, iconType, ...buttonProps }, ref) {
    const iconSize = buttonSize === "small" ? 16 : 20;

    return (
      <StyledButton {...buttonProps} $buttonSize={buttonSize} ref={ref}>
        <Icon iconType={iconType} height={iconSize} width={iconSize} />
      </StyledButton>
    );
  },
);

const StyledButton = styled(Button)<{
  $buttonSize: IconButtonProps["buttonSize"];
}>(
  ({ $buttonSize }) => css`
    padding: unset;
    aspect-ratio: 1;
    width: ${$buttonSize === "small" ? 28 : 36}px;
  `,
);
