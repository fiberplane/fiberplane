import { useContext } from "react";

import type { AbstractChart, Shape } from "../../ACG";
import { AreaShape } from "./AreaShape";
import { RectangleShape } from "./RectangleShape";
import type { CommonShapeProps } from "./types";
import { FocusedShapeListStateContext } from "../context";
import { getShapeListColor } from "../../utils";
import { LineShape } from "./LineShape";
import { PointShape } from "./PointShape";
import type { Scales } from "../types";

type Props<S, P> = {
  chart: AbstractChart<S, P>;
  colors: Array<string>;
  scales: Scales;
};

export function ChartContent<S, P>({
  chart,
  colors,
  scales,
}: Props<S, P>): JSX.Element {
  const { focusedShapeList } = useContext(FocusedShapeListStateContext);

  return (
    <>
      {chart.shapeLists.flatMap((shapeList, listIndex) =>
        shapeList.shapes.map((shape, shapeIndex) => (
          <ChartShape
            anyFocused={!!focusedShapeList}
            color={getShapeListColor(colors, listIndex)}
            focused={shapeList === focusedShapeList}
            key={`${listIndex}-${shapeIndex}`}
            scales={scales}
            shape={shape}
          />
        )),
      )}
    </>
  );
}

type ChartShapeProps<P> = CommonShapeProps & { shape: Shape<P> };

export function ChartShape<P>({
  shape,
  ...props
}: ChartShapeProps<P>): JSX.Element {
  switch (shape.type) {
    case "area":
      return <AreaShape area={shape} {...props} />;

    case "line":
      return <LineShape line={shape} {...props} />;

    case "point":
      return <PointShape point={shape} {...props} />;

    case "rectangle":
      return <RectangleShape rectangle={shape} {...props} />;
  }
}
