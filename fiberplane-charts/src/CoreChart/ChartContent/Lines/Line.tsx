import { LinearGradient } from "@visx/gradient";
import { memo, useId } from "react";

import type { Metric } from "../../../types";
import { Series } from "./Series";
import { TimeScale, ValueScale } from "../../../MetricsChart/scales";

type Props = {
    xScale: TimeScale;
    yScale: ValueScale;
    metrics: Array<Metric>;
    yMax: number;
    highlight?: boolean;
    color: string;
};

export const Line = memo(function Line({
    xScale,
    yScale,
    metrics,
    yMax,
    highlight = false,
    color,
}: Props): JSX.Element {
    const id = useId();
    return (
        <>
            <LinearGradient
                id={`line-${id}`}
                from={color}
                to={color}
                fromOpacity={0.15}
                toOpacity={0.03}
                toOffset="23%"
            />
            <Series
                id={id}
                metrics={metrics}
                xScale={xScale}
                yScale={yScale}
                yMax={yMax}
                // Do naive color selection for now.
                // Later make colors fixed per time series.
                strokeColor={color}
                highlight={highlight}
                fillColor={`url(#line-${id})`}
            />
        </>
    );
});
