import { forwardRef } from "react";
import { styled } from "styled-components";

import { Button } from "./Button";
import { Icon } from "./Icon";

type IconButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "buttonType" | "children"
> &
  Pick<React.ComponentProps<typeof Icon>, "iconType">;

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ iconType, ...buttonProps }, ref) {
    return (
      <StyledButton {...buttonProps} ref={ref}>
        <Icon iconType={iconType} />
      </StyledButton>
    );
  },
);

const StyledButton = styled(Button)`
  padding: unset;
  width: 36px;
  aspect-ratio: 1;
`;
