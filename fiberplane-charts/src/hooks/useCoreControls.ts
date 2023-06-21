import { useMemo } from "react";

import type { CoreControls } from "../context";
import { secondsToTimestamp, timestampToSeconds } from "../utils";
import { useHandler } from "./useHandler";
import { CoreChartProps } from "../CoreChart";

const MIN_DURATION = 60; // in seconds

/**
 * Hook for creating convenient move/zoom functions
 */
export function useCoreControls({
    timeRange,
    onChangeTimeRange,
}: CoreChartProps): CoreControls {
    /**
     * Moves the time scale.
     *
     * @param deltaRatio The delta to move as a ratio of the current time scale
     *                   window. -1 moves a full window to the left, and 1 moves
     *                   a full window to the right.
     */
    const move = useHandler((deltaRatio: number) => {
        const currentFrom = timestampToSeconds(timeRange.from);
        const currentTo = timestampToSeconds(timeRange.to);
        const delta = deltaRatio * (currentTo - currentFrom);
        const from = secondsToTimestamp(currentFrom + delta);
        const to = secondsToTimestamp(currentTo + delta);

        onChangeTimeRange?.({ from, to });
    });

    /**
     * Zooms into or out from the graph.
     *
     * @param factor The zoom factor. Anything below 1 makes the time scale
     *               smaller (zooming in), and anything above 1 makes the time
     *               scale larger (zooming out).
     * @param focusRatio The horizontal point on which to focus the zoom,
     *                   expressed as a ratio from 0 (left-hand side of the graph)
     *                   to 1 (right-hand side of the graph).
     */
    const zoom = useHandler((factor: number, focusRatio = 0.5) => {
        const currentFrom = timestampToSeconds(timeRange.from);
        const currentTo = timestampToSeconds(timeRange.to);
        const duration = currentTo - currentFrom;
        const focusTimestamp = currentFrom + focusRatio * duration;
        const newDuration = Math.max(duration * factor, MIN_DURATION);
        const from = secondsToTimestamp(
            focusTimestamp - newDuration * focusRatio,
        );
        const to = secondsToTimestamp(
            focusTimestamp + newDuration * (1 - focusRatio),
        );

        onChangeTimeRange?.({ from, to });
    });

    return useMemo(() => ({ move, zoom }), [move, zoom]);
}
