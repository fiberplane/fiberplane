import type { Axis } from "../../Mondrian";
import type { Scales } from "../types";

type Props = {
  scales: Scales;
  stroke: string;
  strokeDasharray?: string;
  xAxis: Axis;
  xTicks: Array<number>;
};

export function GridColumns({
  scales: { xScale, yMax },
  xAxis: { maxValue, minValue },
  xTicks,
  ...lineProps
}: Props): JSX.Element {
  return (
    <g>
      {xTicks.map((time, index) => {
        const x = xScale((time - minValue) / (maxValue - minValue));
        return (
          <line
            // rome-ignore lint/suspicious/noArrayIndexKey: no better key available
            key={index}
            x1={x}
            y1={0}
            x2={x}
            y2={yMax}
            strokeWidth={1}
            {...lineProps}
          />
        );
      })}
    </g>
  );
}
