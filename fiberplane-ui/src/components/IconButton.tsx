import { styled } from "styled-components";

import { Button } from "./Button";
import { Icon } from "./Icon";

type IconButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "buttonType" | "children"
> &
  Pick<React.ComponentProps<typeof Icon>, "iconType">;

export function IconButton({ iconType, ...buttonProps }: IconButtonProps) {
  return (
    <StyledButton {...buttonProps}>
      <Icon height="59%" width="59%" iconType={iconType} />
    </StyledButton>
  );
}

const StyledButton = styled(Button)`
  padding: unset;
  width: 36px;
  aspect-ratio: 1;
`;
