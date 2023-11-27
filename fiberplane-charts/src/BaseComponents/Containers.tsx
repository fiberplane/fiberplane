import { styled } from "styled-components";

export const Box = styled.div`
  box-sizing: border-box;
  margin: 0;
  min-width: 0;
`;

export const Container = styled(Box)`
  display: flex;
`;
