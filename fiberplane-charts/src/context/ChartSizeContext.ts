import { createContext } from "react";

export type ChartSizeContextValue = {
    width: number;
    height: number;
    xMax: number;
    yMax: number;
};

/**
 * Context for tracking the size of the chart.
 */
export const ChartSizeContext = createContext<ChartSizeContextValue>({
    width: 0,
    height: 0,
    xMax: 0,
    yMax: 0,
});
