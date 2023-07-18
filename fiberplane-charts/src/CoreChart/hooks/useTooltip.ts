import { useEffect, useRef, useState } from "react";

import {
  AbstractChart,
  Area,
  AreaPoint,
  Line,
  Point,
  Rectangle,
  Shape,
} from "../../Mondrian";
import type {
  ChartCoordinates,
  CloseTooltipFn,
  Dimensions,
  ShowTooltipFn,
  VirtualElement,
} from "../types";
import { getCoordinatesForEvent } from "../utils";
import { getShapeListColor, noop } from "../../utils";
import { MARGINS } from "../constants";
import { useHandler } from "../../hooks";

export type GraphTooltip<S, P> = {
  top: number;
  left: number;
  element: SVGSVGElement;
  color: string;
  sourcePoint: [S, P];
};

type Props<S, P> = {
  chart: AbstractChart<S, P>;
  colors: Array<string>;
  dimensions: Dimensions;
  showTooltip: ShowTooltipFn<S, P> | undefined;
};

/**
 * Handles the detection of where a tooltip should be shown.
 *
 * Should be passed a callback for showing the actual tooltip. If no callback
 * is passed, tooltips are disabled.
 */
export function useTooltip<S, P>(props: Props<S, P>) {
  const [graphTooltip, setGraphTooltip] = useState<GraphTooltip<S, P> | null>(
    null,
  );

  const closeFnRef = useRef<CloseTooltipFn | null>(null);

  const showTooltipFn = props.showTooltip;
  const showTooltip = showTooltipFn
    ? (tip: GraphTooltip<S, P>) => {
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

        closeFnRef.current = showTooltipFn(element, tip.sourcePoint);
      }
    : noop;

  const closeTooltip = useHandler(() => {
    setGraphTooltip(null);

    if (closeFnRef.current) {
      closeFnRef.current();
      closeFnRef.current = null;
    }
  });

  useEffect(() => {
    if (!showTooltipFn) {
      closeTooltip();
    }
  }, [closeTooltip, showTooltipFn]);

  return {
    graphTooltip,

    onMouseMove: (event: React.MouseEvent<SVGSVGElement>) => {
      const closest = getClosestSeriesAndPointWithCoordinates(event, props);
      if (!closest) {
        return;
      }

      const [series, point, coords] = closest;

      const { chart, colors, dimensions } = props;
      const seriesIndex = chart.shapeLists.findIndex(
        (shapeList) => shapeList.source === series,
      );
      const color = getShapeListColor(colors, seriesIndex);

      showTooltip({
        color,
        element: event.currentTarget,
        sourcePoint: [series, point],
        top: (1 - coords.y) * dimensions.yMax + MARGINS.top,
        left: coords.x * dimensions.xMax + MARGINS.left,
      });
    },

    onMouseLeave: () => {
      closeTooltip();
    },
  };
}

/**
 * Returns the closest coordinates where a tooltip should be displayed,
 * including the source series and point that were used to generate the shape
 * at those coordinates.
 */
function getClosestSeriesAndPointWithCoordinates<S, P>(
  event: React.MouseEvent<SVGElement>,
  { chart, dimensions: scales }: Props<S, P>,
): [S, P, ChartCoordinates] | null {
  const coords = getCoordinatesForEvent(event, scales);
  if (!coords) {
    return null;
  }

  let closestSeriesAndPoint: [S, P, ChartCoordinates] | null = null;
  let closestDistance: Distance = [Infinity, 0];
  for (const shapeList of chart.shapeLists) {
    for (const shape of shapeList.shapes) {
      const closest = getClosestPointWithDistance(shape, coords);
      if (!closest) {
        continue;
      }

      const [point, closestCoords, distance] = closest;
      if (isCloser(distance, closestDistance)) {
        closestSeriesAndPoint = [shapeList.source, point, closestCoords];
        closestDistance = distance;
      }
    }
  }

  return closestSeriesAndPoint;
}

function getClosestPointWithDistance<P>(
  shape: Shape<P>,
  coords: ChartCoordinates,
): [P, ChartCoordinates, Distance] | null {
  switch (shape.type) {
    case "area":
      return getClosestPointWithDistanceForArea(shape, coords);
    case "line":
      return getClosestPointWithDistanceForLine(shape, coords);
    case "point":
      return [shape.source, shape, getDistance(coords, shape)];
    case "rectangle":
      return getClosestPointWithDistanceForRectangle(shape, coords);
  }
}

function getClosestPointWithDistanceForArea<P>(
  area: Area<P>,
  coords: ChartCoordinates,
): [P, ChartCoordinates, Distance] | null {
  const len = area.points.length;
  if (len === 0) {
    return null;
  }

  let closest: AreaPoint<P>;
  let horizontalDistance: number;
  if (coords.x < area.points[0].x) {
    closest = area.points[0];
    horizontalDistance = closest.x - coords.x;
  } else if (coords.x > area.points[len - 1].x) {
    closest = area.points[len - 1];
    horizontalDistance = coords.x - closest.x;
  } else {
    closest = area.points[0];
    horizontalDistance = coords.x - closest.x;
    for (let i = 1; i < len; i++) {
      const point = area.points[i];
      const distance = Math.abs(point.x - coords.x);
      if (distance < horizontalDistance) {
        closest = point;
        horizontalDistance = distance;
      } else {
        break;
      }
    }
  }

  let verticalDistance: number;
  if (coords.y < closest.yMin) {
    verticalDistance = closest.yMin - coords.y;
  } else if (coords.y > closest.yMax) {
    verticalDistance = coords.y - closest.yMax;
  } else {
    verticalDistance = 0;
  }

  return [
    closest.source,
    { x: closest.x, y: coords.y < closest.yMin ? closest.yMin : closest.yMax },
    [horizontalDistance, verticalDistance],
  ];
}

function getClosestPointWithDistanceForLine<P>(
  line: Line<P>,
  coords: ChartCoordinates,
): [P, ChartCoordinates, Distance] | null {
  let closestPoint: Point<P> | null = null;
  let closestDistance: Distance = [Infinity, 0];
  for (const point of line.points) {
    const distance = getDistance(coords, point);
    if (isCloser(distance, closestDistance)) {
      closestPoint = point;
      closestDistance = distance;
    }
  }

  return closestPoint
    ? [closestPoint.source, closestPoint, closestDistance]
    : null;
}

function getClosestPointWithDistanceForRectangle<P>(
  rectangle: Rectangle<P>,
  coords: ChartCoordinates,
): [P, ChartCoordinates, Distance] {
  let horizontal: number;
  if (coords.x < rectangle.x) {
    horizontal = rectangle.x - coords.x;
  } else if (coords.x > rectangle.x + rectangle.width) {
    horizontal = coords.x - (rectangle.x + rectangle.width);
  } else {
    horizontal = 0;
  }

  let vertical: number;
  if (coords.y < rectangle.y) {
    vertical = rectangle.y - coords.y;
  } else if (coords.y > rectangle.y + rectangle.height) {
    vertical = coords.y - (rectangle.y + rectangle.height);
  } else {
    vertical = 0;
  }

  return [
    rectangle.source,
    {
      x: rectangle.x + 0.5 * rectangle.width,
      y: rectangle.y + rectangle.height,
    },
    [horizontal, vertical],
  ];
}

type Distance = [horizontal: number, vertical: number];

function getDistance(p1: ChartCoordinates, p2: ChartCoordinates): Distance {
  return [Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y)];
}

/**
 * Returns whether the given distance is closer than the given reference.
 *
 * Horizontal distance is prioritized over vertical distance.
 */
function isCloser(distance: Distance, reference: Distance): boolean {
  return (
    distance[0] < reference[0] ||
    (distance[0] === reference[0] && distance[1] < reference[1])
  );
}
