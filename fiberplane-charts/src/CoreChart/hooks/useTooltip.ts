import { useRef, useState } from "react";

import type {
  CloseTooltipFn,
  ShowTooltipFn,
  VirtualElement,
} from "../../types";
import { noop } from "../../utils";

export type GraphTooltip = {
  top: number;
  left: number;
  element: SVGSVGElement;
  color: string;
  metric: JSX.Element;
};

export function useTooltip(showTooltipFn: ShowTooltipFn | undefined) {
  const [graphTooltip, setGraphTooltip] = useState<GraphTooltip | null>(null);

  const closeFnRef = useRef<CloseTooltipFn | null>(null);

  const showTooltip = showTooltipFn
    ? (tip: GraphTooltip) => {
        setGraphTooltip(tip);

        const element: VirtualElement = {
          getBoundingClientRect: (): DOMRect => {
            const ctm = tip.element.getScreenCTM();
            const point = tip.element.createSVGPoint();
            point.x = tip.left;
            point.y = tip.top;

            const { x, y } = ctm
              ? point.matrixTransform(ctm)
              : { x: tip.left, y: tip.top };

            return new DOMRect(x - 4, y - 4, 8, 8);
          },
          contextElement: tip.element,
        };

        closeFnRef.current = showTooltipFn(element, tip.metric);
      }
    : noop;

  const closeTooltip = () => {
    setGraphTooltip(null);
    if (closeFnRef.current) {
      closeFnRef.current();
      closeFnRef.current = null;
    }
  };

  return {
    graphTooltip,

    onMouseMove: (_event: React.MouseEvent) => {
      // TODO
    },

    onMouseLeave: (_event: React.MouseEvent) => {
      // TODO
    },
  };
}
