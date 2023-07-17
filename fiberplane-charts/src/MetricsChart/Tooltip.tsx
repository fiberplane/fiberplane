import styled from "styled-components";

import type { Metric, Timeseries } from "../providerTypes";

type Props = {
  metric: Metric;
  timeseries: Timeseries;
};

export function Tooltip({ timeseries, metric }: Props): JSX.Element {
  return (
    <table>
      <TimeseriesTableCaption>{metric.time}</TimeseriesTableCaption>
      <thead>
        <tr>
          <th>{timeseries.name || "value"}</th>
          <th>{metric.value}</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(timeseries.labels).map(([key, value]) => (
          <tr key={key}>
            <TimeseriesTableTd>{key}:</TimeseriesTableTd>
            <TimeseriesTableTd>{value}</TimeseriesTableTd>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const TimeseriesTableCaption = styled.caption`
  font-weight: bold;
  text-align: center;
  padding: 0 0 6px;
  color: ${({ theme }) => theme.colorBase400};
`;

const TimeseriesTableTd = styled.td`
  word-wrap: anywhere;
`;
