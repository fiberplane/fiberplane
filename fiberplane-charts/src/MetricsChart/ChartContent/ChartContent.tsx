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
    colors: Array<string>;
};

export function ChartContent({
    timeseriesData,
    xScaleProps,
    yScale,
    colors,
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
