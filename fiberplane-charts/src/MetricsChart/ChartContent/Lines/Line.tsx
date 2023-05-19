import { LinearGradient } from "@visx/gradient";
import { memo } from "react";

import { getChartColor } from "../../../colors";
import type { Metric } from "../../../types";
import { Series } from "./Series";
import { TimeScale, ValueScale } from "../../scales";

type Props = {
    index: number;
    xScale: TimeScale;
    yScale: ValueScale;
    metrics: Array<Metric>;
    yMax: number;
    highlight?: boolean;
    colors: Array<string>;
};

export const Line = memo(function Line({
    xScale,
    yScale,
    metrics,
    index,
    yMax,
    highlight = false,
    colors,
}: Props): JSX.Element {
    const color = getChartColor(index, colors);

    return (
        <>
            <LinearGradient
                id={`line-${index}`}
                from={color}
                to={color}
                fromOpacity={0.15}
                toOpacity={0.03}
                toOffset="23%"
            />
            <Series
                id={index.toString()}
                metrics={metrics}
                xScale={xScale}
                yScale={yScale}
                yMax={yMax}
                // Do naive color selection for now.
                // Later make colors fixed per time series.
                strokeColor={color}
                highlight={highlight}
                fillColor={`url(#line-${index})`}
            />
        </>
    );
});
