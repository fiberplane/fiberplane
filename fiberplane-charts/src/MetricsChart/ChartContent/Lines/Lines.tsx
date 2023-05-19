import { Bar } from "@visx/shape";
import { Group } from "@visx/group";
import { memo, useContext } from "react";

import {
    ChartSizeContext,
    FocusedTimeseriesStateContext,
    TooltipContext,
} from "../../../context";
import {
    ClosestPointArgs,
    formatTimeseries,
    insideRange,
    toClosestPointArgs,
} from "../../../utils";
import { getChartColor } from "../../../colors";
import { Line } from "./Line";
import { MARGINS } from "../../../constants";
import type { Metric, Timeseries } from "../../../types";
import { TimeseriesTableCaption, TimeseriesTableTd } from "../TimeseriesTable";
import type { ValueScale, TimeScale } from "../../scales";
import { useHandler } from "../../../hooks";

export const x = (metric: Metric) => new Date(metric.time).getTime();
export const y = (metric: Metric) => metric.value;

type Props = {
    timeseriesData: Array<Timeseries>;
    xScale: TimeScale;
    yScale: ValueScale;
    colors: Array<string>;
};

export const Lines = memo(function Lines({
    timeseriesData,
    xScale,
    yScale,
    colors,
}: Props) {
    const { xMax, yMax } = useContext(ChartSizeContext);
    const { showTooltip, hideTooltip } = useContext(TooltipContext);

    const handleTooltip = useHandler(
        (event: React.MouseEvent<SVGRectElement>) => {
            const displayed = timeseriesData.filter((series) => series.visible);
            const args = toClosestPointArgs({ event, xScale, yScale });
            const [metric, seriesIndex] = closestMetric({
                timeseriesData: displayed,
                ...args,
            });

            if (metric !== null && seriesIndex !== null) {
                const left = xScale(x(metric)) + MARGINS.left;
                const top = yScale(y(metric)) + MARGINS.top;
                const timeseries = displayed[seriesIndex];

                // metric should not be undefined, but if it is we shouldn't continue
                if (timeseries === undefined) {
                    hideTooltip();
                    return;
                }

                // Find the absoluteIndex so the tooltip color still matches
                // if an element is hidden
                const absoluteIndex = timeseriesData.indexOf(timeseries);

                const svg = event.currentTarget.ownerSVGElement;
                if (svg) {
                    showTooltip({
                        color: getChartColor(absoluteIndex, colors),
                        metric: formatTimeseriesTooltip(timeseries, metric),
                        element: svg,
                        left,
                        top,
                    });
                }
            } else {
                hideTooltip();
            }
        },
    );

    const { focusedTimeseries } = useContext(FocusedTimeseriesStateContext);

    return (
        <>
            {timeseriesData.map(
                (timeseries, index) =>
                    timeseries.visible && (
                        <Group
                            key={formatTimeseries(timeseries, {
                                sortLabels: false,
                            })}
                            opacity={
                                focusedTimeseries === null ||
                                focusedTimeseries === timeseries
                                    ? 1
                                    : 0.2
                            }
                        >
                            <Line
                                index={index}
                                xScale={xScale}
                                yScale={yScale}
                                metrics={timeseries.metrics}
                                yMax={yMax}
                                highlight={focusedTimeseries === timeseries}
                                colors={colors}
                            />
                        </Group>
                    ),
            )}
            <Bar
                width={xMax}
                height={yMax}
                fill="transparent"
                onMouseMove={handleTooltip}
                onMouseLeave={hideTooltip}
            />
        </>
    );
});

function closestMetric({
    timeseriesData,
    xRange,
    yRange,
}: {
    timeseriesData: Array<Timeseries>;
} & ClosestPointArgs): [Metric | null, number | null] {
    let metric: Metric | null = null;
    let seriesIndex: number | null = null;
    let minLen = Number.MAX_SAFE_INTEGER;

    for (const [i, series] of timeseriesData.entries()) {
        const candidates = series.metrics.filter(
            (p) => insideRange(x(p), xRange) && insideRange(y(p), yRange),
        );

        // In order to get a length that is to scale calculate a factor
        // based on the range of the x and y values.
        // This is to offset the fact that the x and y ranges can be on very different scales.
        const xFactor = xRange.high - xRange.low;
        const yFactor = yRange.high - yRange.low;

        for (const p of candidates) {
            const xLen = Math.pow((x(p) - xRange.value) / xFactor, 2);
            const yLen = Math.pow((y(p) - yRange.value) / yFactor, 2);
            const len = xLen + yLen;
            if (len < minLen) {
                minLen = len;
                seriesIndex = i;
                metric = p;
            }
        }
    }

    return [metric, seriesIndex];
}

function formatTimeseriesTooltip(timeseries: Timeseries, metric: Metric) {
    return (
        <table>
            <TimeseriesTableCaption>{metric.time}</TimeseriesTableCaption>
            <thead>
                <tr>
                    <th>{timeseries.name || "value"}</th>
                    <th>{metric.value}</th>
                </tr>
            </thead>
            <tbody>
                {Object.entries(timeseries.labels).map(([key, value]) => (
                    <tr key={key}>
                        <TimeseriesTableTd>{key}:</TimeseriesTableTd>
                        <TimeseriesTableTd>{value}</TimeseriesTableTd>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
