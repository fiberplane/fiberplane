import { type Tween, animate, useMotionValue } from "framer-motion";
import {
  memo,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

import type { AbstractChart, Axis } from "../../Mondrian";
import { ChartThemeContext } from "../../theme";
import { noop } from "../../utils";
import type { Scale, Scales, TickFormatters } from "../types";
import { type Range, createLinearScaleForRange } from "../utils";
import { GridColumns } from "./GridColumns";
import { GridRows } from "./GridRows";
import { XAxis } from "./XAxis";
import { YAxis } from "./YAxis";

type Props = {
  chart: AbstractChart<unknown, unknown>;
  axisLinesShown?: boolean;
  gridColumnsShown?: boolean;
  gridRowsShown?: boolean;
  gridDasharray?: string;
  scales: Scales;
  shouldAnimateYScale?: boolean;
  tickFormatters: TickFormatters;
  numXTicks: number;
  numYTicks: number;
};

export const GridWithAxes = memo(function GridWithAxes({
  chart,
  gridColumnsShown = true,
  gridRowsShown = true,
  axisLinesShown = true,
  gridDasharray,
  numXTicks, // NOTE - default should be set in CoreChart
  numYTicks, // NOTE - default should be set in CoreChart
  scales,
  shouldAnimateYScale,
  tickFormatters,
}: Props) {
  const { xMax, xScale, yMax } = scales;

  const { gridStrokeColor } = useContext(ChartThemeContext);

  const { xAxis, yAxis } = chart;
  const minValue = useCustomSpring(yAxis.minValue, shouldAnimateYScale);
  const maxValue = useCustomSpring(yAxis.maxValue, shouldAnimateYScale);

  const animatedScale = createLinearScaleForRangeWithCustomDomain(
    [yMax, 0],
    [minValue, maxValue],
  );

  const xTicks = useMemo(
    () => getTicks(xAxis, xMax, xScale, numXTicks, getMaxXTickValue),
    [xAxis, xMax, xScale, numXTicks],
  );
  const yTicks = useMemo(
    () => getTicks(yAxis, yMax, animatedScale, numYTicks, getMaxYTickValue),
    [yAxis, yMax, animatedScale, numYTicks],
  );

  return (
    <>
      {gridRowsShown && (
        <GridRows
          stroke={gridStrokeColor}
          strokeDasharray={gridDasharray}
          xMax={xMax}
          yScale={animatedScale}
          yTicks={yTicks}
        />
      )}
      {gridColumnsShown && (
        <GridColumns
          scales={scales}
          stroke={gridStrokeColor}
          strokeDasharray={gridDasharray}
          xAxis={xAxis}
          xTicks={xTicks}
        />
      )}
      {axisLinesShown || tickFormatters.xFormatter ? (
        <XAxis
          formatter={tickFormatters.xFormatter}
          axisLinesShown={axisLinesShown}
          scales={scales}
          strokeColor={gridStrokeColor}
          strokeDasharray={gridDasharray}
          ticks={xTicks}
          xAxis={xAxis}
        />
      ) : null}
      {axisLinesShown || tickFormatters.yFormatter ? (
        <YAxis
          formatter={tickFormatters.yFormatter}
          axisLinesShown={axisLinesShown}
          scales={{ ...scales, yScale: animatedScale }}
          strokeColor={gridStrokeColor}
          strokeDasharray={gridDasharray}
          ticks={yTicks}
        />
      ) : null}
    </>
  );
});

type Domain = [min: number, max: number];

/**
 * Creates a linear scale function for the given range, but uses a custom
 * domain.
 */
function createLinearScaleForRangeWithCustomDomain(
  range: Range,
  [min, max]: Domain,
): Scale {
  const linearScale = createLinearScaleForRange(range);
  return (value) => linearScale((value - min) / (max - min));
}

export function getTicks(
  axis: Axis,
  max: number,
  scale: Scale,
  numTicks: number,
  getMaxAllowedTick: (ticks: Array<number>, maxValue: number) => number,
): Array<number> {
  // If we only want two ticks, just render the min and max
  if (numTicks === 2) {
    return [axis.minValue, axis.maxValue];
  }
  const suggestions = axis.tickSuggestions;
  const { ticks, interval } = suggestions
    ? getTicksAndIntervalFromSuggestions(axis, suggestions, numTicks)
    : getTicksAndIntervalFromRange(axis.minValue, axis.maxValue, numTicks);

  if (interval !== undefined) {
    extendTicksToFitAxis(ticks, axis, max, scale, 2 * numTicks, interval);
  }
  removeLastTickIfTooCloseToMax(ticks, axis.maxValue, getMaxAllowedTick);

  return ticks;
}

function getTicksAndIntervalFromRange(
  minValue: number,
  maxValue: number,
  numTicks: number,
): { ticks: Array<number>; interval?: number } {
  const interval = (maxValue - minValue) / numTicks;

  // NOTE - We need to handle the case where the interval is less than EPSILON,
  //        which is the smallest interval we can represent with javascript's floating point precision
  //        (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/EPSILON)
  if (interval < Number.EPSILON) {
    return {
      ticks: [minValue, maxValue],
    };
  }

  const ticks = [minValue];
  let tick = minValue + interval;

  while (tick < maxValue) {
    ticks.push(tick);
    tick += interval;
  }

  return { ticks, interval };
}

function getTicksAndIntervalFromSuggestions(
  axis: Axis,
  suggestions: Array<number>,
  numTicks: number,
): { ticks: Array<number>; interval?: number } {
  const len = suggestions.length;
  if (len < 2) {
    return { ticks: suggestions };
  }

  const suggestionInterval = suggestions[1] - suggestions[0];
  const axisRange = axis.maxValue - axis.minValue;
  const ticksPerRange = axisRange / suggestionInterval;
  if (ticksPerRange < numTicks) {
    return { ticks: suggestions, interval: suggestionInterval };
  }

  const ticks = [];
  const divisionFactor = Math.ceil(ticksPerRange / numTicks);
  for (let i = 0; i < len; i++) {
    if (i % divisionFactor === 0) {
      ticks.push(suggestions[i]);
    }
  }

  return { ticks, interval: divisionFactor * suggestionInterval };
}

/**
 * Extends the ticks to cover the full range of the axis.
 *
 * Due to animations/translations it is possible the ticks don't yet cover the
 * full range of the axis. This function extends the ticks as necessary, and
 * also includes a slight margin to prevent a "pop-in" effect of suddenly
 * appearing tick labels from the right edge.
 *
 * @note This function mutates the input ticks.
 */
function extendTicksToFitAxis(
  ticks: Array<number>,
  axis: Axis,
  max: number,
  scale: Scale,
  maxTicks: number,
  interval: number,
) {
  const scaleToAxis = (value: number) =>
    scale((value - axis.minValue) / (axis.maxValue - axis.minValue));

  // Trim ticks from the start if the user has dragged them beyond the Y axis.
  while (ticks.length && scaleToAxis(ticks[0]) < 0) {
    ticks.shift();
  }

  let preTick = ticks[0] - interval;
  while (ticks.length < maxTicks && scaleToAxis(preTick) >= 0) {
    ticks.unshift(preTick);
    preTick -= interval;
  }

  let postTick = ticks[ticks.length - 1] + interval;
  while (ticks.length < maxTicks && scaleToAxis(postTick) < 1.1 * max) {
    ticks.push(postTick);
    postTick += interval;
  }
}

const spring: Tween = {
  type: "tween",
  duration: 1,
  easings: ["anticipate"],
};

function useCustomSpring(value: number, shouldAnimate = true) {
  const motionValue = useMotionValue(value);
  const [current, setCurrent] = useState(value);

  useLayoutEffect(() => {
    return motionValue.on("change", (value) => setCurrent(value));
  }, [motionValue]);

  useEffect(() => {
    if (shouldAnimate) {
      const controls = animate(motionValue, value, spring);
      return controls.stop;
    }

    setCurrent(value);

    return noop;
  }, [motionValue, value, shouldAnimate]);

  return current;
}

/**
 * When rendering our svg charts, we want to avoid cutting off tick labels.
 * The way we can do this (simiar to visx's solution) is by not rendering ticks,
 * if they are too close to the axis's max value.
 *
 * The definition of what is "too close" to the max value
 * is determined by the `getMaxTickValue` function.
 *
 * @note This function mutates the input ticks.
 */
const removeLastTickIfTooCloseToMax = (
  ticks: Array<number>,
  maxValue: number,
  getMaxAllowedTick: (ticks: Array<number>, maxValue: number) => number,
) => {
  if (ticks.length < 2) {
    return;
  }

  const maxTickValue = getMaxAllowedTick(ticks, maxValue);

  const lastTick = ticks[ticks.length - 1];
  if (lastTick > maxTickValue) {
    ticks.pop();
  }
};

/**
 * Returns a maximum allowed tick value for the X axis.
 *
 * Heuristic:
 *   If a tick's distance to the maxValue is within 1/2 the size of the tick interval,
 *   the tick will get dropped.
 *
 * Note that the heuristic was determined by trial and error.
 */
export const getMaxXTickValue = (ticks: Array<number>, maxValue: number) => {
  if (ticks.length < 2) {
    return maxValue;
  }

  const interval = ticks[1] - ticks[0];
  return maxValue - interval / 2;
};

/**
 * Returns a maximum allowed tick value for the Y axis.
 *
 * Heuristic:
 *   If a tick's distance to the maxValue is within 1/3 the size of the tick interval,
 *   the tick will get dropped.
 *
 * Note that the heuristic was determined by trial and error.
 */
const getMaxYTickValue = (ticks: Array<number>, maxValue: number) => {
  if (ticks.length < 2) {
    return maxValue;
  }

  const interval = ticks[1] - ticks[0];
  return maxValue - interval / 3;
};
