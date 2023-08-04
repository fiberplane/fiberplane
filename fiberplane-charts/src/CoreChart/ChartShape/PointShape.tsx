import { memo } from "react";

import type { CommonShapeProps } from "./types";
import type { Point } from "../../Mondrian";
import { POINT_RADIUS, POINT_RADIUS_FOCUSED } from "../constants";

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
      r={focused ? POINT_RADIUS_FOCUSED : POINT_RADIUS}
      stroke={color}
      fill={color}
    />
  );
});
