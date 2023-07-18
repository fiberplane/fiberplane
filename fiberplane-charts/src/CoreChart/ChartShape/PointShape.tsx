import { memo } from "react";

import type { CommonShapeProps } from "./types";
import type { Point } from "../../Mondrian";

type Props<P> = CommonShapeProps & {
  point: Point<P>;
};

export const PointShape = memo(function PointShape<P>({
  color,
  focused,
  point,
  scales,
}: Props<P>): JSX.Element {
  return (
    <circle
      x={scales.xScale(point.x)}
      y={scales.yScale(point.y)}
      radius={focused ? 2 : 1}
      stroke={color}
      fill={color}
    />
  );
});
