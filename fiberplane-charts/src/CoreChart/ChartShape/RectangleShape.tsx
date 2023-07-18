import { memo } from "react";

import type { CommonShapeProps } from "./types";
import type { Rectangle } from "../../Mondrian";

type Props<P> = CommonShapeProps & {
  rectangle: Rectangle<P>;
};

export const RectangleShape = memo(function RectangleShape<P>({
  anyFocused,
  color,
  focused,
  rectangle,
  scales: { xMax, yMax },
}: Props<P>): JSX.Element {
  const height = rectangle.height * yMax;

  return (
    <rect
      x={rectangle.x * xMax}
      y={yMax - rectangle.y * yMax - height}
      width={rectangle.width * xMax}
      height={height}
      stroke={color}
      fill={color}
      fillOpacity={0.1}
      opacity={focused || !anyFocused ? 1 : 0.2}
    />
  );
});
