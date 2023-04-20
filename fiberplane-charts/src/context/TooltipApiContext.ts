import { createContext } from "react";

import type { SupportColors } from "../colors";

export type GraphTooltip = {
    top: number;
    left: number;
    element: SVGSVGElement;
    colorName: SupportColors;
    metric: JSX.Element;
};

export type TooltipApi = {
    showTooltip: (tooltip: GraphTooltip) => void;
    hideTooltip: () => void;
};

export const TooltipContext = createContext<TooltipApi>({
    showTooltip() {},
    hideTooltip() {},
});
