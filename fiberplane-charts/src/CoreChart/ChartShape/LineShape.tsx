import { Area } from "@visx/shape";
import { memo, useId } from "react";
import { Threshold } from "@visx/threshold";

import type { CommonShapeProps } from "./types";
import type { Line, Point } from "../../Mondrian";

type Props<P> = CommonShapeProps & {
  line: Line<P>;
};

export const LineShape = memo(function LineShape<P>({
  anyFocused,
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
    <g opacity={focused || !anyFocused ? 1 : 0.2}>
      <defs>
        <linearGradient id={gradientId}>
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="23%" stopColor={color} stopOpacity={0.03} />
        </linearGradient>
      </defs>
      <Threshold<Point<P>>
        id={id}
        data={line.points}
        x={getX}
        y0={getY}
        y1={scales.yScale(0)}
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
    </g>
  );
});
