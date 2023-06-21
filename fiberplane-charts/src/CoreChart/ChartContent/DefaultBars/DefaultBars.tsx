import { Bar } from "@visx/shape";
import { memo, useContext, useMemo } from "react";
import { Group } from "@visx/group";

import {
    ChartSizeContext,
    FocusedTimeseriesStateContext,
} from "../../../context";
import { dateKey, formatTimeseries, toDataItems } from "../../../utils";
import { getChartColor } from "../../../colors";
import { GroupedScales, ValueScale } from "../../../MetricsChart/scales";
import type { Timeseries } from "../../../types";
import { useTooltips } from "./hooks";

type Props = {
    timeseriesData: Array<Timeseries>;
    yScale: ValueScale;
    colors: Array<string>;
} & GroupedScales;

export const DefaultBars = memo(function DefaultBars(
    props: Props,
): JSX.Element {
    const { groupScale, timeseriesData, xScale, yScale, colors } = props;
    const { onMouseMove, onMouseLeave } = useTooltips({
        groupScale,
        timeseriesData,
        xScale,
        yScale,
        colors,
    });

    const dataItems = useMemo(
        () => toDataItems(timeseriesData),
        [timeseriesData],
    );
    const { xMax, yMax } = useContext(ChartSizeContext);

    const bandwidth = groupScale.bandwidth();
    const { focusedTimeseries } = useContext(FocusedTimeseriesStateContext);

    const seriesData = useMemo(() => {
        return timeseriesData.map((timeseries, index) => {
            const color = getChartColor(index, colors);
            return {
                timeseries,
                index,
                x: groupScale(formatTimeseries(timeseries)),
                color,
            };
        });
    }, [timeseriesData, groupScale]);

    return (
        <>
            {dataItems.map((dataItem, index) => (
                <Group
                    key={dataItem[dateKey]}
                    transform={`translate(${xScale(
                        new Date(dataItem[dateKey]).getTime(),
                    )}, 0)`}
                >
                    {seriesData.map(({ timeseries, x, color }, keyIndex) => {
                        const value = dataItem.data.get(timeseries);
                        if (value === undefined) {
                            return null;
                        }

                        return (
                            <Bar
                                key={formatTimeseries(timeseries, {
                                    sortLabels: false,
                                })}
                                id={`stack-${index}-${keyIndex}`}
                                x={x}
                                y={yScale(value)}
                                height={yMax - yScale(value)}
                                width={bandwidth}
                                stroke={color}
                                fill={color}
                                fillOpacity={0.1}
                                opacity={
                                    focusedTimeseries === null ||
                                    focusedTimeseries === timeseries
                                        ? 1
                                        : 0.2
                                }
                            />
                        );
                    })}
                </Group>
            ))}
            <Bar
                width={xMax}
                height={yMax}
                fill="transparent"
                onMouseMove={onMouseMove}
                onMouseLeave={onMouseLeave}
            />
        </>
    );
});
