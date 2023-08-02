import { memo, useId } from "react";

import type { Area } from "../../Mondrian";
import type { CommonShapeProps } from "./types";
import { createAreaPathDef } from "./paths/createAreaPathDef";

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
  const clipPathId = `threshold-clip-above-${id}`;

  const x = (point: { x: number }) => scales.xScale(point.x);
  const y0 = (point: { yMin: number }) => scales.yScale(point.yMin);
  const y1 = (point: { yMax: number }) => scales.yScale(point.yMax);

  const pathDef = createAreaPathDef(area.points, { x, y0, y1 });

  return (
    <g opacity={focused || !anyFocused ? 1 : 0.2}>
      <defs>
        {areaGradientShown ? (
          <linearGradient id={gradientId}>
            <stop offset="0%" stopColor={color} stopOpacity={0.15} />
            <stop offset="80%" stopColor={color} stopOpacity={0.03} />
          </linearGradient>
        ) : null}
        <clipPath id={clipPathId}>
          <path d={createAreaPathDef(area.points, { x, y0: 0, y1 })} />
        </clipPath>
      </defs>
      <path
        d={pathDef}
        clipPath={`url(#${clipPathId})`}
        strokeWidth={0}
        fill={fillColor}
      />
      <path
        d={pathDef}
        stroke={color}
        strokeWidth={focused ? 1.5 : 1}
        fill={fillColor}
      />
    </g>
  );
});
