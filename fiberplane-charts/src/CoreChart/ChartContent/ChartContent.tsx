import type { AbstractChart } from "../../ACG";
import { Areas } from "./Areas";
import { BarsStacked } from "./BarsStacked";
import { DefaultBars } from "./DefaultBars";
import { Lines } from "./Lines";
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
  if (xScaleProps.graphType === "line" && xScaleProps.stackingType === "none") {
    return (
      <Lines
        timeseriesData={timeseriesData}
        xScale={xScaleProps.xScale}
        yScale={yScale}
        colors={colors}
      />
    );
  }

  if (xScaleProps.graphType === "line") {
    return (
      <Areas
        timeseriesData={timeseriesData}
        xScale={xScaleProps.xScale}
        yScale={yScale}
        asPercentage={xScaleProps.stackingType === "percentage"}
        colors={colors}
      />
    );
  }

  if (xScaleProps.stackingType === "none") {
    return (
      <DefaultBars
        groupScale={xScaleProps.groupScale}
        timeseriesData={timeseriesData}
        xScale={xScaleProps.xScale}
        yScale={yScale}
        colors={colors}
      />
    );
  }

  return (
    <BarsStacked
      timeseriesData={timeseriesData}
      xScale={xScaleProps.xScale}
      yScale={yScale}
      asPercentage={xScaleProps.stackingType === "percentage"}
      colors={colors}
    />
  );
}
