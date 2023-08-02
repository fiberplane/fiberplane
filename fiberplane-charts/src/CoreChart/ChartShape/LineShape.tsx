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
  const clipPathId = `clip-path-${id}`;

  const x = (point: { x: number }) => scales.xScale(point.x);
  const y = (point: { y: number }) => scales.yScale(point.y);

  const gradientPathDef = createAreaPathDef(line.points, {
    x,
    y0: y,
    y1: scales.yScale(0),
  });

  return (
    <g opacity={focused || !anyFocused ? 1 : 0.2}>
      {areaGradientShown && (
        <defs>
          <linearGradient id={gradientId} x1={0} y1={0} x2={0} y2={1}>
            <stop offset="0%" stopColor={color} stopOpacity={0.15} />
            <stop offset="23%" stopColor={color} stopOpacity={0.03} />
          </linearGradient>
          <clipPath id={clipPathId}>
            <path d={gradientPathDef} />
          </clipPath>
        </defs>
      )}
      {areaGradientShown && (
        <path d={gradientPathDef} strokeWidth={0} fill={gradiantRef} />
      )}
      <path
        d={createLinePathDef(line.points, { x, y })}
        clipPath={areaGradientShown ? `url(#${clipPathId})` : undefined}
        stroke={color}
        strokeWidth={focused ? 1.5 : 1}
        fill={areaGradientShown ? gradiantRef : "transparent"}
      />
    </g>
  );
});
