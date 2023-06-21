import { ChartLegendProps } from "../ChartLegend/types";
import type {
    GraphType,
    StackingType,
    Timeseries,
    TimeRange,
    ShowTooltipFn,
} from "../types";
import type { GroupedScales, TimeScale } from "./scales";

export type TotalBarType = {
    graphType: "bar";
    stackingType: "none";
} & GroupedScales;

export type LineBarType = {
    graphType: "line";
    stackingType: StackingType;
    xScale: TimeScale;
};

export type StackedBarType = {
    graphType: "bar";
    stackingType: Exclude<StackingType, "none">;
    xScale: TimeScale;
};

export type XScaleProps = TotalBarType | LineBarType | StackedBarType;
