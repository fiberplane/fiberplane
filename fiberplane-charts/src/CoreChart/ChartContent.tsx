import type { AbstractChart, ShapeList } from "../Mondrian";
import { ChartShape } from "./ChartShape";
import { getShapeListColor } from "../utils";
import type { Scales } from "./types";

type Props<S, P> = {
  chart: AbstractChart<S, P>;
  colors: Array<string>;
  focusedShapeList: ShapeList<S, P> | null;
  scales: Scales;
};

export function ChartContent<S, P>({
  chart,
  colors,
  focusedShapeList,
  scales,
}: Props<S, P>): JSX.Element {
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
