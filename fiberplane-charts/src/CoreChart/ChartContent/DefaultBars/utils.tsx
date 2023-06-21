import { DefaultTheme } from "styled-components";
import type { ScaleBand } from "d3-scale";

import {
    compact,
    formatTimeseries,
    getBoundary,
    insideRange,
} from "../../../utils";
import { getChartColor } from "../../../colors";
import type { GraphTooltip } from "../../../context";
import { MARGINS } from "../../../constants";
import type { Metric, Timeseries } from "../../../types";
import { TimeseriesTableCaption, TimeseriesTableTd } from "../TimeseriesTable";
import { ValueScale } from "../../../MetricsChart/scales";

/**
 * Returns the relative value inside a band.
 *
 * Use case: get the X value as it is inside a specific band (useful when you
 * have scales inside scales)
 */
export function getValueInsideScale<T extends { toString(): string }>(
    value: number,
    scale: ScaleBand<T>,
): number {
    // Calculate the max width
    const maxScale = scale.step() * scale.domain().length;

    // clamp the value to this range
    const clamped = clamp(
        value - scale.paddingOuter() * scale.step(),
        0,
        maxScale,
    );

    // Get the value for inside the groupScale
    return clamped % scale.step();
}

export function clamp(min: number, value: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

/**
 * Convenient object to store information about a possible candidate
 */
export type Candidate = {
    timeseriesIndex: number;
    timeseries: Timeseries;
    metric: Metric;
};

type GetCandidatesArgs = {
    x: number;
    xScale: ScaleBand<string>;
    y: number;
    yScale: ValueScale;
    timeseriesData: Array<Timeseries>;
    activeTimestamp: string;
};

export function getCandidate({
    x,
    xScale,
    y,
    yScale,
    timeseriesData,
    activeTimestamp,
}: GetCandidatesArgs): Candidate | null {
    const possibleTimeseries = timeseriesData.filter(
        (series) => series.visible,
    );

    const yRange = getBoundary({
        value: y,
        EPS: 80,
        scale: yScale,
    });

    const candidates: Array<Candidate> = compact(
        possibleTimeseries.map((timeseries) => {
            // Find the index for looking up the metric in the results
            const timeseriesIndex = xScale
                .domain()
                .indexOf(formatTimeseries(timeseries));
            const series = timeseriesData[timeseriesIndex];
            const metric = series?.metrics.find(
                (item) => item.time === activeTimestamp,
            );

            // Check if there's no metric or it's outside of the range.
            if (!metric || !insideRange(metric.value, yRange)) {
                return null;
            }

            return {
                timeseries,
                timeseriesIndex,
                metric,
            };
        }),
    );

    let minLen = Number.MAX_SAFE_INTEGER;
    let closest: Candidate | null = null;

    for (const candidate of candidates) {
        const candidateX = xScale(
            formatTimeseries(candidate.timeseries),
        )?.valueOf();
        if (candidateX === undefined) {
            continue;
        }

        const xLen = Math.pow(x - candidateX, 2);
        const yLen = Math.pow(y - yScale(candidate.metric.value).valueOf(), 2);
        const len = xLen + yLen;

        if (len < minLen) {
            minLen = len;
            closest = candidate;
        }
    }

    return closest;
}

/**
 * BandScales don't have an invert function
 *
 * This function re-implements the logic and takes paddingOuter/inner into
 * consideration so we can do more than just set a single padding value
 */
export function invert<T extends { toString(): string }>(
    scale: ScaleBand<T>,
    value: number,
): T | undefined {
    const [lower, upper] = scale.range();
    const start = Math.min(lower, upper);
    const end = Math.max(lower, upper);
    const domain = scale.domain();

    const paddingOuter = scale.paddingOuter();
    const paddingInner = scale.paddingInner();

    /**
     * The range isn't divided into equal sections, padding outer offsets
     * the pattern as well as the paddingInner is used n(items) - 1 times
     */
    const calculatedItems = domain.length + 2 * paddingOuter - paddingInner;
    const itemWidth = (end - start) / calculatedItems;

    const beginOffset = (0.5 * paddingInner - paddingOuter) * itemWidth;
    const offsetX = value + beginOffset;
    const closestIndex = Math.floor(offsetX / itemWidth);
    return domain[clamp(0, closestIndex, domain.length - 1)];
}

/**
 * Retrieve a range of possible values in the domain
 */
export function invertRange<T extends { toString(): string }>(
    scale: ScaleBand<T>,
    range: { low: number; high: number },
): Array<T> {
    const lowValue = invert(scale, range.low);
    const highValue = invert(scale, range.high);
    if (lowValue === undefined || highValue === undefined) {
        return [];
    }

    if (lowValue === highValue) {
        return [lowValue];
    }

    const domain = scale.domain();
    const lowIndex = domain.indexOf(lowValue);
    const highIndex = domain.indexOf(highValue);

    return domain.slice(lowIndex, highIndex);
}

type GetTooltipArgs = {
    candidate: Candidate;
    groupScale: ScaleBand<string>;
    xScale: ScaleBand<number>;
    yScale: ValueScale;
    element: SVGSVGElement;
    colors: Array<string>;
};

export function getTooltipData({
    candidate,
    groupScale,
    xScale,
    yScale,
    element,
    colors,
}: GetTooltipArgs): GraphTooltip | null {
    const { metric, timeseries, timeseriesIndex } = candidate;
    const activeTimestamp = metric.time;
    const bandwidth = groupScale.bandwidth();

    // Calculate proper positions
    const left =
        (groupScale(formatTimeseries(timeseries)) ?? 0) +
        (xScale(new Date(activeTimestamp).getTime())?.valueOf() ?? 0) +
        MARGINS.left +
        0.5 * bandwidth;
    const top = yScale(metric.value).valueOf() + MARGINS.top;

    const color = getChartColor(timeseriesIndex, colors);
    return {
        top,
        left,
        color,
        element,
        metric: formatTimeseriesTooltip(timeseries, metric, activeTimestamp),
    };
}

function formatTimeseriesTooltip(
    timeseries: Timeseries,
    metric: Metric,
    activeTimestamp: string,
) {
    const labelEntries = Object.entries(timeseries.labels);
    return (
        <table>
            <TimeseriesTableCaption>{activeTimestamp}</TimeseriesTableCaption>
            <thead>
                <tr>
                    <th>{timeseries.name || "value"}</th>
                    <th>{metric.value}</th>
                </tr>
            </thead>
            <tbody>
                {labelEntries.map(([key, value]) => (
                    <tr key={key}>
                        <TimeseriesTableTd>{key}:</TimeseriesTableTd>{" "}
                        <TimeseriesTableTd>{value}</TimeseriesTableTd>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
