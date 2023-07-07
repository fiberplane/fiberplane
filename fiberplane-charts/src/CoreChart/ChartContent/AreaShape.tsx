import { Area as VisxArea } from "@visx/shape";
import { LinearGradient } from "@visx/gradient";
import { Threshold } from "@visx/threshold";
import { useId } from "react";

import type { Area, AreaPoint } from "../../ACG";
import type { CommonShapeProps } from "./types";

type Props<P> = CommonShapeProps & {
  area: Area<P>;
};

export function AreaShape<P>({
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
    <>
      <LinearGradient
        id={gradientId}
        from={color}
        to={color}
        fromOpacity={0.15}
        toOpacity={0.03}
        toOffset="80%"
      />
      <Threshold<AreaPoint<P>>
        id={id}
        data={area.points}
        x={getX}
        y0={getY0}
        y1={getY1}
        clipAboveTo={0}
        clipBelowTo={scales.yMax}
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
    </>
  );
}
