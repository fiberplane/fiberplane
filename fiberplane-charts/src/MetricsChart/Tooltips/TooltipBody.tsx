import styled from "styled-components";

export function TooltipBody({
  labels,
}: { labels: Record<string, string> }): JSX.Element {
  return (
    <tbody>
      {Object.entries(labels).map(([key, value]) => (
        <tr key={key}>
          <LabelTd>{key}:</LabelTd>
          <LabelTd>{value}</LabelTd>
        </tr>
      ))}
    </tbody>
  );
}

const LabelTd = styled.td`
  word-wrap: anywhere;
`;
