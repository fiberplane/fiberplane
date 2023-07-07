import { Area } from "@visx/shape";
import { LinearGradient } from "@visx/gradient";
import { Threshold } from "@visx/threshold";
import { useId } from "react";

import type { CommonShapeProps } from "./types";
import type { Line, Point } from "../../ACG";

type Props<P> = CommonShapeProps & {
  line: Line<P>;
};

export function LineShape<P>({
  color,
  focused,
  line,
  scales,
}: Props<P>): JSX.Element {
  const id = useId();
  const gradientId = `line-${id}`;
  const fillColor = `url(#${gradientId})`;

  const getX = (point: { x: number }) => scales.xScale(point.x);
  const getY = (point: { y: number }) => scales.yScale(point.y);

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
      <Threshold<Point<P>>
        id={id}
        data={line.points}
        x={getX}
        y0={getY}
        y1={getY({ y: 0 })}
        clipAboveTo={0}
        clipBelowTo={scales.yMax}
        aboveAreaProps={{ fill: fillColor }}
        // Keep this one around to spot any incorrect threshold computations.
        belowAreaProps={{ fill: "violet" }}
      />
      <Area
        data={line.points}
        x={getX}
        y={getY}
        stroke={color}
        strokeWidth={focused ? 1.5 : 1}
        fill={fillColor}
      />
    </>
  );
}
