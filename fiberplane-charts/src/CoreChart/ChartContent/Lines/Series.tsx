import { AxisScale } from "@visx/axis";
import { Area } from "@visx/shape";
import { Threshold } from "@visx/threshold";
import { memo } from "react";

import type { Metric } from "../../../types";
import { x, y, ValueScale } from "../../../MetricsChart/scales";

type Props = {
  id: string;
  metrics: Metric[];
  xScale: AxisScale<number>;
  yScale: ValueScale;
  yMax: number;
  fillColor: string;
  strokeColor: string;
  highlight?: boolean;
};

export const Series = memo(function Series({
  metrics,
  xScale,
  yScale,
  yMax,
  strokeColor,
  fillColor,
  id,
  highlight = false,
}: Props) {
  return (
    <>
      <Threshold<Metric>
        id={id}
        data={metrics}
        x={(d) => xScale(x(d)) ?? 0}
        y0={(d) => yScale(y(d)) ?? 0}
        y1={yScale(0)}
        clipAboveTo={0}
        clipBelowTo={yMax}
        aboveAreaProps={{ fill: fillColor }}
        // Keep this one around to spot any incorrect threshold computations.
        belowAreaProps={{ fill: "violet" }}
      />
      <Area
        data={metrics}
        x={(d) => xScale(x(d)) ?? 0}
        y={(d) => yScale(y(d)) ?? 0}
        stroke={strokeColor}
        strokeWidth={highlight ? 1.5 : 1}
        fill={fillColor}
      />
    </>
  );
});
