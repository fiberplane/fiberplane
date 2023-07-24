import styled from "styled-components";

export const TooltipCaption = styled.caption`
  font-weight: bold;
  text-align: center;
  padding: 0 0 6px;
  color: ${({ theme }) => theme.colorBase400};
`;
