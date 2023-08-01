import { memo, useId } from "react";

import type { Area, AreaPoint } from "../../Mondrian";
import type { CommonShapeProps } from "./types";
import { createAreaPathDef } from "./paths/createAreaPathDef";
import { Threshold } from "./Threshold";

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
        {areaGradientShown ? (
          <linearGradient id={gradientId}>
            <stop offset="0%" stopColor={color} stopOpacity={0.15} />
            <stop offset="80%" stopColor={color} stopOpacity={0.03} />
          </linearGradient>
        ) : null}
      </defs>
      <Threshold<AreaPoint<P>>
        id={id}
        data={area.points}
        fillColor={fillColor}
        x={getX}
        y0={getY0}
        y1={getY1}
      />
      <path
        d={createAreaPathDef(area.points, { x: getX, y0: getY0, y1: getY1 })}
        stroke={color}
        strokeWidth={focused ? 1.5 : 1}
        fill={fillColor}
      />
    </g>
  );
});
