import { useContext } from "react";
import styled, { css } from "styled-components";

import { ThemeContext } from "../theme";

export const ButtonGroup = styled.span(() => {
  const theme = useContext(ThemeContext);

  return css`
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 4px 8px;
    background: ${theme.buttonBackground};
    border-radius: ${theme.buttonBorderRadius};
  `;
});
