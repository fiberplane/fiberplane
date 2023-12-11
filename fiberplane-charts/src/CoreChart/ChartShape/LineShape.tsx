import { memo, useId } from "react";

import type { Line } from "../../Mondrian";
import { createAreaPathDef, createLinePathDef } from "./paths";
import type { CommonShapeProps } from "./types";

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
  strokeWidth,
}: Props<P>): JSX.Element {
  const id = useId();
  const gradientId = `line-${id}`;

  const x = (point: { x: number }) => scales.xScale(point.x);
  const y = (point: { y: number }) => scales.yScale(point.y);

  const focusedStrokeWidth = strokeWidth * 1.5;

  return (
    <g opacity={focused || !anyFocused ? 1 : 0.2}>
      {areaGradientShown && (
        <defs>
          <linearGradient id={gradientId} x1={0} y1={0} x2={0} y2={1}>
            <stop offset="0%" stopColor={color} stopOpacity={0.15} />
            <stop offset="23%" stopColor={color} stopOpacity={0.03} />
          </linearGradient>
        </defs>
      )}
      {areaGradientShown && (
        <path
          d={createAreaPathDef(line.points, { x, y0: y, y1: scales.yScale(0) })}
          stroke="none"
          fill={`url(#${gradientId})`}
        />
      )}
      <path
        d={createLinePathDef(line.points, { x, y })}
        stroke={color}
        strokeDasharray={line.strokeDasharray?.join(" ")}
        strokeWidth={focused ? focusedStrokeWidth : strokeWidth}
        fill="none"
      />
    </g>
  );
});
