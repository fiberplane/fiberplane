import { LinearGradient } from "@visx/gradient";
import { memo } from "react";
import { useTheme } from "styled-components";

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
};

export const Line = memo(function Line({
    xScale,
    yScale,
    metrics,
    index,
    yMax,
    highlight = false,
}: Props): JSX.Element {
    const theme = useTheme();
    const color = theme[getChartColor(index)];

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
