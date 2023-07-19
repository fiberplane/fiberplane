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
      cx={scales.xScale(point.x)}
      cy={scales.yScale(point.y)}
      r={focused ? 2 : 1}
      stroke={color}
      fill={color}
    />
  );
});
