import styled from "styled-components";

export const ButtonGroup = styled.span`
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 4px 8px;
  background: ${({ theme }) => theme.colorBase200};
  border-radius: ${({ theme }) => theme.borderRadius500};
`;
