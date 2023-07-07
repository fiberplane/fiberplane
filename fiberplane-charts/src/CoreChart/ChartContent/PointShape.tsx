import { Circle } from "@visx/shape";

import type { CommonShapeProps } from "./types";
import type { Point } from "../../ACG";

type Props<P> = CommonShapeProps & {
  point: Point<P>;
};

export function PointShape<P>({
  color,
  focused,
  point,
  scales,
}: Props<P>): JSX.Element {
  return (
    <Circle
      x={scales.xScale(point.x)}
      y={scales.yScale(point.y)}
      radius={focused ? 2 : 1}
      stroke={color}
      fill={color}
    />
  );
}
