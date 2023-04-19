import { VirtualElement } from "@popperjs/core";
import { useRef, useState } from "react";

import type { CloseTooltipFn } from "../../../../types";
import { showTooltip } from "../../../../thunks";
import { useHandler } from "./useHandler";
import { SupportColors } from "../colors";

export type GraphTooltip = {
  top: number;
  left: number;
  element: SVGSVGElement;
  colorName: SupportColors;
  metric: JSX.Element;
};

export function useTooltip() {
  const [graphTooltip, setGraphTooltip] = useState<GraphTooltip | null>(null);

  const closeFnRef = useRef<CloseTooltipFn | null>(null);

  return {
    graphTooltip,

    showTooltip: useHandler((tip: GraphTooltip) => {
      setGraphTooltip(tip);

      const element: VirtualElement = {
        getBoundingClientRect: (): DOMRect => {
          const ctm = tip.element.getScreenCTM();
          const point = tip.element.createSVGPoint();
          point.x = tip.left;
          point.y = tip.top;

          const { x = tip.left, y = tip.top } =
            ctm === null ? {} : point.matrixTransform(ctm);

          return new DOMRect(x - 4, y - 4, 8, 8);
        },
        contextElement: tip.element,
      };

      closeFnRef.current = dispatch(showTooltip(element, tip.metric));
    }),

    hideTooltip: useHandler(() => {
      setGraphTooltip(null);
      if (closeFnRef.current) {
        closeFnRef.current();
        closeFnRef.current = null;
      }
    }),
  };
}
