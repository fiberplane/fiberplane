import type { AbstractChart, ShapeList } from "../Mondrian";
import { ChartShape } from "./ChartShape";
import type { Scales } from "./types";

type Props<S, P> = {
  areaGradientShown: boolean;
  chart: AbstractChart<S, P>;
  focusedShapeList: ShapeList<S, P> | null;
  getShapeListColor: (shapeList: ShapeList<S, P>) => string;
  scales: Scales;
};

export function ChartContent<S, P>({
  areaGradientShown,
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
            areaGradientShown={areaGradientShown}
            color={getShapeListColor(shapeList)}
            focused={shapeList === focusedShapeList}
            key={`${listIndex}-${shapeIndex}`}
            scales={scales}
            shape={shape}
            sourceType={getSourceTypeIfExists(shapeList.source)}
          />
        )),
      )}
    </>
  );
}

function getSourceTypeIfExists(source: unknown): string {
  if (typeof source === "object" && source !== null && "type" in source) {
    return typeof source.type === "string" ? source.type : "";
  }

  return "";
}
