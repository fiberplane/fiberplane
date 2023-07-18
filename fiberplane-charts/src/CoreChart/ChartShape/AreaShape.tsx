import { Area as VisxArea } from "@visx/shape";
import { memo, useId } from "react";
import { Threshold } from "@visx/threshold";

import type { Area, AreaPoint } from "../../Mondrian";
import type { CommonShapeProps } from "./types";

type Props<P> = CommonShapeProps & {
  area: Area<P>;
};

export const AreaShape = memo(function AreaShape<P>({
  anyFocused,
  area,
  color,
  focused,
  scales,
}: Props<P>): JSX.Element {
  const id = useId();
  const gradientId = `line-${id}`;
  const fillColor = `url(#${gradientId})`;

  const getX = (point: { x: number }) => scales.xScale(point.x);
  const getY0 = (point: { yMin: number }) => scales.yScale(point.yMin);
  const getY1 = (point: { yMax: number }) => scales.yScale(point.yMax);

  return (
    <g opacity={focused || !anyFocused ? 1 : 0.2}>
      <defs>
        <linearGradient id={gradientId}>
          <stop offset="0%" stopColor={color} stopOpacity={0.15} />
          <stop offset="80%" stopColor={color} stopOpacity={0.03} />
        </linearGradient>
      </defs>
      <Threshold<AreaPoint<P>>
        id={id}
        data={area.points}
        x={getX}
        y0={getY0}
        y1={getY1}
        clipAboveTo={0}
        clipBelowTo={getY1}
        aboveAreaProps={{ fill: fillColor }}
        // Keep this one around to spot any incorrect threshold computations.
        belowAreaProps={{ fill: "violet" }}
      />
      <VisxArea
        data={area.points}
        x={getX}
        y0={getY0}
        y1={getY1}
        stroke={color}
        strokeWidth={focused ? 1.5 : 1}
        fill={fillColor}
      />
    </g>
  );
});
