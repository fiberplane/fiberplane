import { Areas } from "./Areas";
import { BarsStacked } from "./BarsStacked";
import { DefaultBars } from "./DefaultBars";
import { Lines } from "./Lines";
import type { Timeseries } from "../../types";
import type { ValueScale } from "../scales";
import type { XScaleProps } from "../types";

type Props = XScaleProps & {
  timeseriesData: Array<Timeseries>;
  yScale: ValueScale;
};

export function ChartContent({
  timeseriesData,
  yScale,
  ...scaleProps
}: Props): JSX.Element {
  if (scaleProps.graphType === "line" && scaleProps.stackingType === "none") {
    return (
      <Lines
        timeseriesData={timeseriesData}
        xScale={scaleProps.xScale}
        yScale={yScale}
      />
    );
  }

  if (scaleProps.graphType === "line") {
    return (
      <Areas
        timeseriesData={timeseriesData}
        xScale={scaleProps.xScale}
        yScale={yScale}
        asPercentage={scaleProps.stackingType === "percentage"}
      />
    );
  }

  if (scaleProps.stackingType === "none") {
    return (
      <DefaultBars
        groupScale={scaleProps.groupScale}
        timeseriesData={timeseriesData}
        xScale={scaleProps.xScale}
        yScale={yScale}
      />
    );
  }

  return (
    <BarsStacked
      timeseriesData={timeseriesData}
      xScale={scaleProps.xScale}
      yScale={yScale}
      asPercentage={scaleProps.stackingType === "percentage"}
    />
  );
}
