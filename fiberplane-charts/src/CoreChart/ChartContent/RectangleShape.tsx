import { Bar } from "@visx/shape";

import type { CommonShapeProps } from "./types";
import type { Rectangle } from "../../ACG";

type Props<P> = CommonShapeProps & {
  rectangle: Rectangle<P>;
};

export function RectangleShape<P>({
  anyFocused,
  color,
  focused,
  rectangle,
  scales,
}: Props<P>): JSX.Element {
  return (
    <Bar
      x1={scales.xScale(rectangle.xMin)}
      x2={scales.xScale(rectangle.xMax)}
      y1={scales.yScale(rectangle.yMin)}
      y2={scales.yScale(rectangle.yMax)}
      stroke={color}
      fill={color}
      fillOpacity={0.1}
      opacity={focused || !anyFocused ? 1 : 0.2}
    />
  );
}
