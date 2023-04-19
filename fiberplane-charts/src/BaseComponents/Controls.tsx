import styled from "styled-components";

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

export const ControlsSetLabel = styled.span`
  font: ${({ theme }) => theme.fontControlsShortHand};
  letter-spacing: ${({ theme }) => theme.fontControlsLetterSpacing};
  color: ${({ theme }) => theme.colorBase500};
`;
