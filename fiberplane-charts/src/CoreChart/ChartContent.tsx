import type { AbstractChart, ShapeList } from "../Mondrian";
import { ChartShape } from "./ChartShape";
import type { Scales } from "./types";

type Props<S, P> = {
  areaGradientShown: boolean;
  chart: AbstractChart<S, P>;
  focusedShapeList: ShapeList<S, P> | null;
  getShapeListColor: (source: S, index: number) => string;
  strokeWidth: number;
  scales: Scales;
};

export function ChartContent<S, P>({
  areaGradientShown,
  chart,
  focusedShapeList,
  getShapeListColor,
  strokeWidth,
  scales,
}: Props<S, P>): JSX.Element {
  return (
    <>
      {chart.shapeLists.flatMap((shapeList, listIndex) =>
        shapeList.shapes.map((shape, shapeIndex) => (
          <ChartShape
            anyFocused={!!focusedShapeList}
            areaGradientShown={areaGradientShown}
            color={getShapeListColor(shapeList.source, listIndex)}
            focused={shapeList === focusedShapeList}
            // biome-ignore lint/suspicious/noArrayIndexKey: We don't have a unique key for the shape.
            key={`${listIndex}-${shapeIndex}`}
            strokeWidth={strokeWidth}
            scales={scales}
            shape={shape}
          />
        )),
      )}
    </>
  );
}
