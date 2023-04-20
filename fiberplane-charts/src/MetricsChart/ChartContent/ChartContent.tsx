import { Areas } from "./Areas";
import { BarsStacked } from "./BarsStacked";
import { DefaultBars } from "./DefaultBars";
import { Lines } from "./Lines";
import type { Timeseries } from "../../types";
import type { ValueScale } from "../scales";
import type { XScaleProps } from "../types";

type Props = {
    timeseriesData: Array<Timeseries>;
    xScaleProps: XScaleProps;
    yScale: ValueScale;
};

export function ChartContent({
    timeseriesData,
    xScaleProps,
    yScale,
}: Props): JSX.Element {
    if (
        xScaleProps.graphType === "line" &&
        xScaleProps.stackingType === "none"
    ) {
        return (
            <Lines
                timeseriesData={timeseriesData}
                xScale={xScaleProps.xScale}
                yScale={yScale}
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
            />
        );
    }

    return (
        <BarsStacked
            timeseriesData={timeseriesData}
            xScale={xScaleProps.xScale}
            yScale={yScale}
            asPercentage={xScaleProps.stackingType === "percentage"}
        />
    );
}
