import type { AbstractChart, ShapeList } from "../Mondrian";
import { ChartShape } from "./ChartShape";
import type { Scales } from "./types";

type Props<S, P> = {
  chart: AbstractChart<S, P>;
  focusedShapeList: ShapeList<S, P> | null;
  getShapeListColor: (shapeList: ShapeList<S, P>) => string;
  scales: Scales;
};

export function ChartContent<S, P>({
  chart,
  focusedShapeList,
  getShapeListColor,
  scales,
}: Props<S, P>): JSX.Element {
  return (
    <>
      {chart.shapeLists.flatMap((shapeList, listIndex) =>
        shapeList.shapes.map((shape, shapeIndex) => (
          <ChartShape
            anyFocused={!!focusedShapeList}
            color={getShapeListColor(shapeList)}
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
