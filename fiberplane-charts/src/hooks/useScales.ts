import { useContext, useMemo } from "react";

import {
    ChartSizeContext,
    InteractiveControlsState,
    InteractiveControlsStateContext,
} from "../context";
import {
    getGroupedScales,
    getTimeScale,
    getValueScale,
} from "../MetricsChart/scales";
import type { MetricsChartProps, XScaleProps } from "../MetricsChart/types";
import { secondsToTimestamp, timestampToSeconds } from "../utils";
import type { TimeRange } from "../types";

export function useScales({
    graphType,
    timeseriesData,
    stackingType,
    timeRange,
}: MetricsChartProps) {
    const { xMax, yMax } = useContext(ChartSizeContext);
    const controlsState = useContext(InteractiveControlsStateContext);

    const xScaleProps = useMemo((): XScaleProps => {
        if (graphType === "bar" && stackingType === "none") {
            return {
                graphType,
                stackingType,
                ...getGroupedScales(timeseriesData, controlsState, xMax),
            };
        }

        return {
            graphType,
            stackingType,
            xScale: getTimeScale(
                translateTimeRange(timeRange, controlsState, xMax),
                xMax,
            ),
        } as XScaleProps;
    }, [
        timeRange,
        xMax,
        controlsState,
        graphType,
        timeseriesData,
        stackingType,
    ]);

    const yScale = useMemo(
        () => getValueScale({ timeseriesData, stackingType, yMax }),
        [timeseriesData, stackingType, yMax],
    );

    return { xScaleProps, yScale };
}

/**
 * Translates a time-range based on the active zoom state.
 */
function translateTimeRange(
    timeRange: TimeRange,
    controlsState: InteractiveControlsState,
    xMax: number,
): TimeRange {
    if (controlsState.type === "drag") {
        const { start, end } = controlsState;
        if (end !== undefined && start !== end) {
            const from = timestampToSeconds(timeRange.from);
            const to = timestampToSeconds(timeRange.to);
            const delta = ((start - end) / xMax) * (to - from);
            return {
                from: secondsToTimestamp(from + delta),
                to: secondsToTimestamp(to + delta),
            };
        }
    }

    return timeRange;
}
