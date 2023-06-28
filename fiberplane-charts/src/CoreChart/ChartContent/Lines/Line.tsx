import { Area } from "@visx/shape";
import { LinearGradient } from "@visx/gradient";
import { Threshold } from "@visx/threshold";
import { memo, useId } from "react";

import type { Metric } from "../../../types";
import { x, y, TimeScale, ValueScale } from "../../../MetricsChart/scales";

type Props = {
  xScale: TimeScale;
  yScale: ValueScale;
  metrics: Array<Metric>;
  yMax: number;
  highlight?: boolean;
  color: string;
};

export const Line = memo(function Line({
  xScale,
  yScale,
  metrics,
  yMax,
  highlight = false,
  color,
}: Props): JSX.Element {
  const id = useId();
  const gradientId = `line-${id}`;
  const fillColor = `url(#${gradientId})`;

  const getX = (metric: Metric) => xScale(x(metric)) ?? 0;
  const getY = (metric: Metric) => yScale(y(metric)) ?? 0;

  return (
    <>
      <LinearGradient
        id={gradientId}
        from={color}
        to={color}
        fromOpacity={0.15}
        toOpacity={0.03}
        toOffset="23%"
      />
      <Threshold<Metric>
        id={id}
        data={metrics}
        x={getX}
        y0={getY}
        y1={yScale(0)}
        clipAboveTo={0}
        clipBelowTo={yMax}
        aboveAreaProps={{ fill: fillColor }}
        // Keep this one around to spot any incorrect threshold computations.
        belowAreaProps={{ fill: "violet" }}
      />
      <Area
        data={metrics}
        x={getX}
        y={getY}
        stroke={color}
        strokeWidth={highlight ? 1.5 : 1}
        fill={fillColor}
      />
    </>
  );
});
