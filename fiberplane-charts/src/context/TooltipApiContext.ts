import { createContext } from "react";

export type GraphTooltip = {
  top: number;
  left: number;
  element: SVGSVGElement;
  color: string;
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
