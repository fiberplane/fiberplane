import { Area } from "@visx/shape";
import { LinearGradient } from "@visx/gradient";
import { memo, useId } from "react";
import { Threshold } from "@visx/threshold";

import type { Point } from "../../../ACG";

type Props = {
  points: Array<Point>;
  yMax: number;
  highlight?: boolean;
  color: string;
};

export const Line = memo(function Line({
  points,
  yMax,
  highlight = false,
  color,
}: Props): JSX.Element {
  const id = useId();
  const gradientId = `line-${id}`;
  const fillColor = `url(#${gradientId})`;

  const getX = (point: { x: number }) => point.x * width;
  const getY = (point: { y: number }) => point.y * height;

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
      <Threshold<Point>
        id={id}
        data={points}
        x={getX}
        y0={getY}
        y1={getY({ y: 0 })}
        clipAboveTo={0}
        clipBelowTo={yMax}
        aboveAreaProps={{ fill: fillColor }}
        // Keep this one around to spot any incorrect threshold computations.
        belowAreaProps={{ fill: "violet" }}
      />
      <Area
        data={points}
        x={getX}
        y={getY}
        stroke={color}
        strokeWidth={highlight ? 1.5 : 1}
        fill={fillColor}
      />
    </>
  );
});
