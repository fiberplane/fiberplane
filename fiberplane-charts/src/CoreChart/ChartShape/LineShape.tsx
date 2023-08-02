import { memo, useId } from "react";

import type { CommonShapeProps } from "./types";
import type { Line } from "../../Mondrian";
import { createAreaPathDef, createLinePathDef } from "./paths";

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
  const gradiantRef = `url(#${gradientId})`;

  const x = (point: { x: number }) => scales.xScale(point.x);
  const y = (point: { y: number }) => scales.yScale(point.y);
  const clipY1 = scales.yScale(0);

  return (
    <g opacity={focused || !anyFocused ? 1 : 0.2}>
      {areaGradientShown ? (
        <defs>
          <linearGradient id={gradientId}>
            <stop offset="0%" stopColor={color} stopOpacity={0.15} />
            <stop offset="23%" stopColor={color} stopOpacity={0.03} />
          </linearGradient>
        </defs>
      ) : null}
      {areaGradientShown ? (
        <path
          d={createAreaPathDef(line.points, { x, y0: y, y1: clipY1 })}
          strokeWidth={0}
          fill={gradiantRef}
        />
      ) : null}
      <path
        d={createLinePathDef(line.points, { x, y })}
        stroke={color}
        strokeWidth={focused ? 1.5 : 1}
        fill={areaGradientShown ? gradiantRef : "transparent"}
      />
    </g>
  );
});
