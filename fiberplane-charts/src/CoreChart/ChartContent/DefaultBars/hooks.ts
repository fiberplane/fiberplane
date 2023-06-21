import { localPoint } from "@visx/event";
import type { ScaleBand } from "d3-scale";
import { useContext } from "react";

import {
    getCandidate,
    getTooltipData,
    getValueInsideScale,
    invert,
} from "./utils";
import { MARGINS } from "../../../constants";
import type { Timeseries } from "../../../types";
import { TooltipContext } from "../../../context";
import { useHandler } from "../../../hooks";
import { ValueScale } from "../../../MetricsChart/scales";

type Params = {
    groupScale: ScaleBand<string>;
    timeseriesData: Array<Timeseries>;
    xScale: ScaleBand<number>;
    yScale: ValueScale;
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
    const { groupScale, timeseriesData, xScale, yScale, colors } = params;

    const { showTooltip, hideTooltip } = useContext(TooltipContext);

    const onMouseMove = useHandler(
        (event: React.MouseEvent<SVGRectElement>) => {
            const { x: x0, y: y0 } = localPoint(event) || { x: 0, y: 0 };

            const x = x0 - MARGINS.left;
            const y = y0 - MARGINS.top;

            // Find the relevant timestamp
            const activeTimestamp = invert(xScale, x);
            if (activeTimestamp === undefined) {
                hideTooltip();
                return;
            }

            // Convert x to value as it would be inside the step of the scale
            // You can consider it to be x % xScale.step()
            // but with some additional math due considering padding + clamp logic
            // to avoid issues at the boundary of the graph
            const xInTimescale = getValueInsideScale(x, xScale);

            const candidate = getCandidate({
                x: xInTimescale, // xInTimescale is now the "x"
                xScale: groupScale, // Groupscale is now the main X scale
                timeseriesData,
                activeTimestamp: new Date(activeTimestamp).toISOString(),
                y,
                yScale,
            });

            if (!candidate) {
                hideTooltip();
                return;
            }

            const svg = event.currentTarget.ownerSVGElement;
            const tooltipData =
                svg &&
                getTooltipData({
                    candidate,
                    xScale,
                    yScale,
                    element: svg,
                    groupScale,
                    colors,
                });

            if (!tooltipData) {
                hideTooltip();
                return;
            }

            showTooltip(tooltipData);
        },
    );

    return {
        onMouseMove,
        onMouseLeave: hideTooltip,
    };
}
