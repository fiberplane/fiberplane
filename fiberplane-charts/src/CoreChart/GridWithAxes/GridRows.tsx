import type { Scale } from "../types";

type Props = {
  stroke: string;
  strokeDasharray?: string;
  xMax: number;
  yScale: Scale;
  yTicks: Array<number>;
};

export function GridRows({
  xMax,
  yScale,
  yTicks,
  ...lineProps
}: Props): JSX.Element {
  return (
    <g>
      {yTicks.map((value, index) => {
        const y = yScale(value);
        return (
          <line
            // rome-ignore lint/suspicious/noArrayIndexKey: no better key available
            key={index}
            x1={0}
            y1={y}
            x2={xMax}
            y2={y}
            strokeWidth={1}
            {...lineProps}
          />
        );
      })}
    </g>
  );
}
