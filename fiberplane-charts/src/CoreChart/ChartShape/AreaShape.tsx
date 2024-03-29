import { memo, useId } from "react";

import type { Area } from "../../Mondrian";
import { createAreaPathDef } from "./paths";
import type { CommonShapeProps } from "./types";

type Props<P> = CommonShapeProps & {
  area: Area<P>;
};

export const AreaShape = memo(function AreaShape<P>({
  anyFocused,
  areaGradientShown,
  area,
  color,
  focused,
  scales,
  strokeWidth,
}: Props<P>): JSX.Element {
  const id = useId();
  const gradientId = `line-${id}`;
  const gradientRef = `url(#${gradientId})`;

  const x = (point: { x: number }) => scales.xScale(point.x);
  const y0 = (point: { yMin: number }) => scales.yScale(point.yMin);
  const y1 = (point: { yMax: number }) => scales.yScale(point.yMax);

  const focusedStrokeWidth = strokeWidth * 1.5;

  return (
    <g opacity={focused || !anyFocused ? 1 : 0.2}>
      {areaGradientShown && (
        <defs>
          <linearGradient id={gradientId} x1={0} y1={0} x2={0} y2={1}>
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="80%" stopColor={color} stopOpacity={0.06} />
          </linearGradient>
        </defs>
      )}
      <path
        d={createAreaPathDef(area.points, { x, y0, y1 })}
        stroke={color}
        strokeDasharray={area.strokeDasharray?.join(" ")}
        strokeWidth={focused ? focusedStrokeWidth : strokeWidth}
        fill={areaGradientShown ? gradientRef : "none"}
      />
    </g>
  );
});
