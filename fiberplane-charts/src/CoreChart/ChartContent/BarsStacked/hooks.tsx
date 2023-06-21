import { useContext } from "react";

import { calculateBandwidth } from "./utils";
import { ChartSizeContext, TooltipContext } from "../../../context";
import {
    ClosestPointArgs,
    DataItem,
    getTimestamp,
    insideRange,
    toClosestPointArgs,
} from "../../../utils";
import { getChartColor } from "../../../colors";
import { MARGINS } from "../../../constants";
import type { Metric, OtelMetadata, Timeseries } from "../../../types";
import type { TimeScale, ValueScale } from "../../../MetricsChart/scales";
import { TimeseriesTableCaption, TimeseriesTableTd } from "../TimeseriesTable";

type Params = {
    dataItems: Array<DataItem>;
    timeseriesData: Array<Timeseries>;
    xScale: TimeScale;
    yScale: ValueScale;
    asPercentage: boolean;
    colors: Array<string>;
};

type Handlers = {
    onMouseMove: React.MouseEventHandler;
    onMouseLeave: React.MouseEventHandler;
};

/**
 * Hook managing tooltips/mouseevents for BarStacked component
 */
export function useTooltips(params: Params): Handlers {
    const { dataItems, xScale, yScale, timeseriesData, asPercentage, colors } =
        params;
    const { xMax } = useContext(ChartSizeContext);

    const { showTooltip, hideTooltip } = useContext(TooltipContext);

    const onMouseMove = (event: React.MouseEvent<SVGRectElement>) => {
        const args = toClosestPointArgs({ event, xScale, yScale, EPS: 40 });
        const metric = closestMetric({ dataItems, ...args });

        if (metric === null) {
            hideTooltip();
            return;
        }

        const svg = event.currentTarget.ownerSVGElement;
        if (svg) {
            const bandwidth = calculateBandwidth(xMax, dataItems.length);

            const { cumulativeValue, time, timeseries } = metric;
            const seriesIndex = timeseriesData.indexOf(timeseries);

            showTooltip({
                top: yScale(cumulativeValue) + MARGINS.top,
                left: xScale(new Date(time)) + MARGINS.left + 0.5 * bandwidth,
                color: getChartColor(seriesIndex, colors),
                element: svg,
                metric: formatMetricTooltip(timeseries, metric, asPercentage),
            });
        }
    };

    return {
        onMouseMove,
        onMouseLeave: hideTooltip,
    };
}

type BareMetric = Omit<Metric, keyof OtelMetadata>;

type CandidateValue = {
    cumulativeValue: number;
    timeseries: Timeseries;
};

function closestMetric({
    dataItems,
    xRange,
    yRange,
}: {
    dataItems: DataItem[];
} & ClosestPointArgs): (BareMetric & CandidateValue) | null {
    let metric: ReturnType<typeof closestMetric> = null;
    let minLen = Number.MAX_SAFE_INTEGER;

    for (const item of dataItems) {
        const x = getTimestamp(item);
        if (!insideRange(x, xRange)) {
            continue;
        }

        let y = 0;
        const candidates: CandidateValue[] = [];
        for (const [metric, value] of item.data.entries()) {
            y += value;

            if (insideRange(y, yRange)) {
                candidates.push({ timeseries: metric, cumulativeValue: y });
            }
        }

        if (candidates.length > 0) {
            const xLen = Math.pow(xRange.value - x, 2);

            for (const { timeseries, cumulativeValue } of candidates) {
                const value = item.data.get(timeseries);
                const yLen = Math.pow(yRange.value - cumulativeValue, 2);

                const len = xLen + yLen;

                if (len < minLen && value !== undefined) {
                    minLen = len;
                    metric = {
                        cumulativeValue,
                        time: new Date(x).toISOString(),
                        timeseries,
                        value,
                    };
                }
            }
        }
    }

    return metric;
}

function formatMetricTooltip(
    timeseries: Timeseries,
    metric: BareMetric & CandidateValue,
    asPercentage = false,
) {
    const labelEntries = Object.entries(timeseries.labels);
    return (
        <table>
            <TimeseriesTableCaption>{metric.time}</TimeseriesTableCaption>
            <thead>
                <tr>
                    <th>{timeseries.name || "value"}</th>
                    <th>
                        {asPercentage
                            ? `${metric.value.toLocaleString("en-US", {
                                  maximumFractionDigits: 2,
                                  minimumFractionDigits: 2,
                                  useGrouping: false,
                              })}%`
                            : metric.value}
                    </th>
                </tr>
            </thead>
            <tbody>
                {labelEntries.map(([key, value]) => (
                    <tr key={key}>
                        <TimeseriesTableTd>{key}: </TimeseriesTableTd>
                        <TimeseriesTableTd>{value}</TimeseriesTableTd>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
