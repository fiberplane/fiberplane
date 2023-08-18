import { useContext } from "react";
import styled, { css } from "styled-components";

import { ChartThemeContext } from "../theme";

export const ControlsContainer = styled.div`
  display: flex;
  margin: 0 0 12px;
  gap: 24px;
`;

export const ControlsGroup = styled.div`
  display: flex;
  gap: 8px;
`;

export const ControlsSet = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

export const ControlsSetLabel = styled.span(() => {
  const theme = useContext(ChartThemeContext);

  return css`
    font: ${theme.buttonFont};
    color: ${theme.buttonColor};
  `;
});
