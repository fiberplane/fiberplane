import { styled } from "styled-components";

import { Icon } from "./Icon";
import { Button } from "./Button";

type IconButtonProps = Omit<React.ComponentProps<typeof Button>, "children"> &
  Pick<React.ComponentProps<typeof Icon>, "iconType">;

export function IconButton({ iconType, ...buttonProps }: IconButtonProps) {
  return (
    <StyledButton {...buttonProps}>
      <Icon iconType={iconType} />
    </StyledButton>
  );
}

const StyledButton = styled(Button)`
  padding: unset;
  width: 36px;
  aspect-ratio: 1;
`;
