import { memo, useId } from "react";

import type { CommonShapeProps } from "./types";
import type { Line, Point } from "../../Mondrian";
import { Threshold } from "./Threshold";
import { createLinePathDef } from "./paths";

type Props<P> = CommonShapeProps & {
  line: Line<P>;
};

export const LineShape = memo(function LineShape<P>({
  anyFocused,
  areaGradientShown,
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
        {areaGradientShown ? (
          <linearGradient id={gradientId}>
            <stop offset="0%" stopColor={color} stopOpacity={0.15} />
            <stop offset="23%" stopColor={color} stopOpacity={0.03} />
          </linearGradient>
        ) : null}
      </defs>
      <Threshold<Point<P>>
        id={id}
        data={line.points}
        fillColor={fillColor}
        x={getX}
        y0={getY}
        y1={scales.yScale(0)}
      />
      <path
        d={createLinePathDef(line.points, { x: getX, y: getY })}
        stroke={color}
        strokeWidth={focused ? 1.5 : 1}
        fill={fillColor}
      />
    </g>
  );
});
