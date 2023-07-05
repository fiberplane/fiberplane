import type { AbstractChart } from "../../ACG";
import { Areas } from "./Areas";
import { BarsStacked } from "./BarsStacked";
import { DefaultBars } from "./DefaultBars";
import { Lines } from "./Lines";
import type { Scales } from "../../hooks";

type Props = {
  chart: AbstractChart;
  colors: Array<string>;
  scales: Scales;
};

export function ChartContent({ chart, colors, scales }: Props): JSX.Element {
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
