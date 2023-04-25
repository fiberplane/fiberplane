import { Bar } from "@visx/shape";
import { memo, useContext, useMemo } from "react";
import { Group } from "@visx/group";
import { useTheme } from "styled-components";

import {
    ChartSizeContext,
    FocusedTimeseriesStateContext,
} from "../../../context";
import { dateKey, formatTimeseries, toDataItems } from "../../../utils";
import { getChartColor } from "../../../colors";
import { GroupedScales, ValueScale } from "../../scales";
import type { Timeseries } from "../../../types";
import { useTooltips } from "./hooks";

type Props = {
    timeseriesData: Array<Timeseries>;
    yScale: ValueScale;
} & GroupedScales;

export const DefaultBars = memo(function DefaultBars(
    props: Props,
): JSX.Element {
    const { groupScale, timeseriesData, xScale, yScale } = props;
    const { onMouseMove, onMouseLeave } = useTooltips({
        groupScale,
        timeseriesData,
        xScale,
        yScale,
    });
    const theme = useTheme();

    const dataItems = useMemo(
        () => toDataItems(timeseriesData),
        [timeseriesData],
    );
    const { xMax, yMax } = useContext(ChartSizeContext);

    const bandwidth = groupScale.bandwidth();
    const { focusedTimeseries } = useContext(FocusedTimeseriesStateContext);

    const seriesData = useMemo(() => {
        return timeseriesData.map((timeseries, index) => {
            const colorName = getChartColor(index);
            return {
                timeseries,
                index,
                x: groupScale(formatTimeseries(timeseries)),
                colorName,
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
                    {seriesData.map(
                        ({ timeseries, x, colorName }, keyIndex) => {
                            const value = dataItem.data.get(timeseries);
                            if (value === undefined) {
                                return null;
                            }

                            const color = theme[colorName];

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
                        },
                    )}
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
