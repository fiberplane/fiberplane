import { AreaStack, Bar } from "@visx/shape";
import { LinearGradient } from "@visx/gradient";
import { memo, useContext, useMemo } from "react";
import { SeriesPoint } from "@visx/shape/lib/types";
import { Group } from "@visx/group";

import {
    ChartSizeContext,
    FocusedTimeseriesStateContext,
    TooltipContext,
} from "../../context";
import {
    DataItem,
    dataToPercentages,
    toDataItems,
    ClosestPointArgs,
    insideRange,
    toClosestPointArgs,
    getTimestamp,
} from "../../utils";
import { formatTimeseries } from "../../utils";
import { getChartColor } from "../../colors";
import { MARGINS } from "../../constants";
import type { Metric, OtelMetadata, Timeseries } from "../../types";
import { TimeScale, ValueScale } from "../../MetricsChart/scales";
import { TimeseriesTableCaption, TimeseriesTableTd } from "./TimeseriesTable";

type Props = {
    timeseriesData: Array<Timeseries>;
    xScale: TimeScale;
    yScale: ValueScale;
    asPercentage?: boolean;
    colors: Array<string>;
};

const getY0 = (d: SeriesPoint<DataItem>) => d[0];
const getY1 = (d: SeriesPoint<DataItem>) => d[1];

export const Areas = memo(function Areas({
    timeseriesData,
    xScale,
    yScale,
    asPercentage = false,
    colors,
}: Props) {
    const { xMax, yMax } = useContext(ChartSizeContext);
    const { showTooltip, hideTooltip } = useContext(TooltipContext);
    const dataItems = useMemo(() => {
        const dataItems = toDataItems(timeseriesData);
        return asPercentage ? dataToPercentages(dataItems) : dataItems;
    }, [timeseriesData, asPercentage]);

    const timeseriesArray = dataItems[0] ? [...dataItems[0].data.keys()] : [];
    const keys = timeseriesArray.map((series) => formatTimeseries(series));

    const handleTooltip = (event: React.MouseEvent<SVGRectElement>) => {
        const args = toClosestPointArgs({ event, xScale, yScale });
        const metric = closestMetric({ dataItems, ...args });

        if (metric) {
            const left = xScale(new Date(metric.time)) + MARGINS.left;
            const top = yScale(metric.cumulativeValue) + MARGINS.top;
            const seriesIndex = timeseriesData.indexOf(metric.timeseries);
            const timeseries = timeseriesData[seriesIndex];

            const svg = event.currentTarget.ownerSVGElement;
            if (svg) {
                showTooltip({
                    color: getChartColor(seriesIndex, colors),
                    metric: formatTimeseriesTooltip(
                        timeseries,
                        metric,
                        asPercentage,
                    ),
                    element: svg,
                    left,
                    top,
                });
            }
        } else {
            hideTooltip();
        }
    };

    const { focusedTimeseries } = useContext(FocusedTimeseriesStateContext);
    const focusedKey = focusedTimeseries && formatTimeseries(focusedTimeseries);
    return (
        <>
            <AreaStack
                keys={keys}
                data={dataItems}
                x={(d) => xScale(getTimestamp(d.data)) ?? 0}
                value={(d: DataItem, key: string): number => {
                    const index = keys.indexOf(key);
                    const metric = timeseriesArray[index];
                    return (metric && d.data.get(metric)) || 0;
                }}
                y0={(d) => yScale(getY0(d)) ?? 0}
                y1={(d) => yScale(getY1(d)) ?? 0}
            >
                {({ stacks, path }) =>
                    stacks
                        .map((series, index) => {
                            const realIndex = timeseriesData.findIndex(
                                (item) => formatTimeseries(item) === series.key,
                            );
                            const timeseries = timeseriesData[realIndex];
                            const color = getChartColor(realIndex, colors);

                            return (
                                <Group
                                    opacity={
                                        focusedKey === null ||
                                        focusedKey === series.key
                                            ? 1
                                            : 0.2
                                    }
                                    key={formatTimeseries(timeseries, {
                                        sortLabels: false,
                                    })}
                                >
                                    <LinearGradient
                                        id={`line-${index}`}
                                        from={color}
                                        to={color}
                                        fromOpacity={0.15}
                                        toOpacity={0.03}
                                        toOffset="80%"
                                    />
                                    <path
                                        key={`stack-${series.key}`}
                                        id={series.key}
                                        d={path(series) || ""}
                                        stroke={color}
                                        fill={`url(#line-${index})`}
                                    />
                                </Group>
                            );
                        })
                        .reverse()
                }
            </AreaStack>
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
    dataItems: Array<DataItem>;
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
        for (const [timeseries, value] of item.data.entries()) {
            y += value;

            if (insideRange(y, yRange)) {
                candidates.push({ cumulativeValue: y, timeseries });
            }
        }

        if (candidates.length > 0) {
            const xLen = Math.pow(xRange.value - x, 2);

            for (const { cumulativeValue, timeseries } of candidates) {
                const yLen = Math.pow(yRange.value - cumulativeValue, 2);
                const len = xLen + yLen;
                const value = item.data.get(timeseries);
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

function formatTimeseriesTooltip(
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
                        <TimeseriesTableTd>{key}:</TimeseriesTableTd>
                        <TimeseriesTableTd>{value}</TimeseriesTableTd>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}
