import { scaleUtc, scaleLinear, scaleBand } from "@visx/scale";

import { formatTimeseries } from "../utils";
import type { InteractiveControlsState } from "../context";
import type { Metric, StackingType, TimeRange, Timeseries } from "../types";

const getTime = (timestamp: string) => new Date(timestamp).getTime();

export const x = (metric: Metric) => getTime(metric.time);
export const y = (metric: Metric) => metric.value;

export function getTimeScale(timeRange: TimeRange, xMax: number) {
    return scaleUtc<number>({
        range: [0, xMax],
        domain: [
            new Date(timeRange.from).getTime(),
            new Date(timeRange.to).getTime(),
        ],
    });
}

export type TimeScale = ReturnType<typeof getTimeScale>;

/**
 * In short: get two scales. This is used for bar charts (no `stackingType`),
 * where there's an `xScale` chart which contains the timeseries and a
 * `groupScale` for each of the metrics for each timestamp.
 */
export function getGroupedScales(
    timeseriesData: Array<Timeseries>,
    controlsState: InteractiveControlsState,
    xMax: number,
) {
    const formattedVisibleTimeseries = timeseriesData
        .filter((series) => series.visible)
        .map((series) => formatTimeseries(series));

    const timestampSet = new Set<string>();
    for (const item of timeseriesData) {
        for (const metric of item.metrics) {
            timestampSet.add(metric.time);
        }
    }

    const timestamps = [...timestampSet].map(getTime).sort((a, b) => a - b);

    const delta =
        controlsState.type === "drag" && typeof controlsState.end === "number"
            ? controlsState.end - controlsState.start
            : 0;

    const xScale = scaleBand<number>({
        range: [0 + delta, xMax + delta],
        domain: timestamps,
        padding: 0.2,
    });

    const groupScale = scaleBand<string>({
        range: [0, xScale.bandwidth()],
        domain: formattedVisibleTimeseries,
        padding: 0.2,
    });

    return {
        xScale,
        groupScale,
    };
}

export type GroupedScales = ReturnType<typeof getGroupedScales>;
export type XScaleTypes = TimeScale | GroupedScales["xScale"];

type MinMax = {
    min: number;
    max: number;
};

export function getValueScale({
    timeseriesData,
    yMax,
    stackingType = "none",
}: {
    timeseriesData: Array<Timeseries>;
    yMax: number;
    stackingType?: StackingType;
}) {
    const { min, max } = getMinMax(timeseriesData, stackingType);
    const delta = max - min;

    return scaleLinear({
        range: [yMax, 0],
        round: false,
        nice: false,
        domain: [
            // only use min when stackingType is default, otherwise use 0
            // stacked graphs can otherwise overlap the axis text
            stackingType === "none" && min ? min : 0,
            stackingType === "percentage" ? max : max + delta * 0.05,
        ],
    });
}

export type ValueScale = ReturnType<typeof getValueScale>;

function getMinMax(
    timeseriesData: Array<Timeseries>,
    stackingType: StackingType,
): Readonly<MinMax> {
    switch (stackingType) {
        case "none":
            return getMinMaxDefault(timeseriesData);
        case "percentage":
            return { min: 0, max: 100 };
        case "stacked":
            return getMinMaxStacked(timeseriesData);
    }
}

function getMinMaxDefault(timeseriesData: Array<Timeseries>): Readonly<MinMax> {
    const yValues = timeseriesData
        .filter((result) => result.visible)
        .flatMap((series) => series.metrics.map(y));
    const min = yValues.length > 0 ? Math.min(...yValues) : 0;
    const max = yValues.length > 0 ? Math.max(...yValues) : 0;

    if (min === max) {
        // If all values are the same, we need to add/subtract a small offset
        // to/from min/max, otherwise the scale will be broken. But we should be
        // also careful not to drop the minimum below 0 if that's not necessary,
        // because it can give very odd results otherwise. The `-0.001` value
        // makes sure that we see at least a line with "0" values, or you might
        // not see whether there are any results at all.
        return {
            min: min < 0 || min >= 1 ? min - 1 : min - 0.001,
            max: max + 1,
        };
    }

    return {
        min,
        max,
    };
}

function getMinMaxStacked(timeseriesData: Array<Timeseries>): Readonly<MinMax> {
    const totals = new Map<number, number>();
    for (const series of timeseriesData) {
        if (!series.visible) {
            continue;
        }

        for (const metric of series.metrics) {
            const time = getTime(metric.time);
            totals.set(time, (totals.get(time) ?? 0) + metric.value);
        }
    }

    return {
        min: Math.min(...totals.values()),
        max: Math.max(...totals.values()),
    };
}
