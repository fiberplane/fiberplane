import { Bar } from "@visx/shape";
import { LinearGradient } from "@visx/gradient";
import { memo, ReactNode, useContext, useMemo } from "react";

import { calculateBandwidth } from "./utils";
import {
    ChartSizeContext,
    FocusedTimeseriesStateContext,
} from "../../../context";
import {
    dataToPercentages,
    dateKey,
    getTimestamp,
    toDataItems,
} from "../../../utils";
import { getChartColor } from "../../../colors";
import type { TimeScale, ValueScale } from "../../../MetricsChart/scales";
import type { Timeseries } from "../../../types";
import { useTooltips } from "./hooks";

type Props = {
    timeseriesData: Array<Timeseries>;
    xScale: TimeScale;
    yScale: ValueScale;
    asPercentage?: boolean;
    colors: Array<string>;
};

export const BarsStacked = memo(function BarsStacked(props: Props) {
    const {
        timeseriesData,
        xScale,
        yScale,
        asPercentage = false,
        colors,
    } = props;

    const { xMax, yMax } = useContext(ChartSizeContext);

    const dataItems = useMemo(() => {
        const dataItems = toDataItems(timeseriesData);
        return asPercentage ? dataToPercentages(dataItems) : dataItems;
    }, [timeseriesData, asPercentage]);

    const { onMouseMove, onMouseLeave } = useTooltips({
        dataItems,
        timeseriesData,
        xScale,
        yScale,
        asPercentage,
        colors,
    });

    const bandwidth = calculateBandwidth(xMax, dataItems.length);
    const { focusedTimeseries } = useContext(FocusedTimeseriesStateContext);

    return (
        <>
            {dataItems.map((item) => {
                let offsetY = 0;
                const timestamp = item[dateKey];
                const x = xScale(getTimestamp(item)) ?? 0;

                const bars: Array<ReactNode> = [];
                for (const [timeseries, value] of item.data.entries()) {
                    const realIndex = timeseriesData.indexOf(timeseries);

                    const yValue = value;
                    const originalY = yValue === undefined ? 0 : yScale(yValue);
                    const height = yMax - originalY;
                    const translatedY = originalY - offsetY;
                    offsetY += height;

                    const color = getChartColor(realIndex, colors);

                    bars.push(
                        <LinearGradient
                            id={`fill-${timestamp}-line-${realIndex}`}
                            key={`fill-${timestamp}-line-${realIndex}-gradient`}
                            from={color}
                            to={color}
                            fromOpacity={0.15}
                            toOpacity={0.03}
                        />,
                        <Bar
                            key={`stack-${timestamp}-${realIndex}`}
                            id={`stack-${timestamp}-${realIndex}`}
                            x={x}
                            y={translatedY}
                            height={height}
                            width={bandwidth}
                            stroke={color}
                            fill={`url(#fill-${timestamp}-line-${realIndex})`}
                            opacity={
                                focusedTimeseries === null ||
                                focusedTimeseries === timeseries
                                    ? 1
                                    : 0.2
                            }
                        />,
                    );
                }

                return bars;
            })}
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
