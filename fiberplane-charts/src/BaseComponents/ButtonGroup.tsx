import { useContext } from "react";
import { css, styled } from "styled-components";

import { ChartThemeContext } from "../theme";

export const ButtonGroup = styled.span(() => {
  const theme = useContext(ChartThemeContext);

  return css`
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 4px 8px;
    background: ${theme.buttonGroupBackgroundColor};
    border-radius: ${theme.buttonGroupBorderRadius};
  `;
});
