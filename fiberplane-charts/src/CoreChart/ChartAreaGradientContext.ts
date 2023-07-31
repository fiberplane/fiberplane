import { createContext } from "react";

/**
 * Context for tracking whether or not the chart should render a gradient for Area shapes
 * Defaults to `true` to maintain backwards compatibility
 */
export const ChartAreaGradientContext = createContext<boolean>(true);
